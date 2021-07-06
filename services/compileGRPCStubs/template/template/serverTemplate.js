exports.default = function (serviceId) {
  const serviceIdPath = serviceId.replace(/-/g, "").toLowerCase();
  return `
import express from "express";
import aiService , {getServiceClient} from "./aiService";

let localConcurrencyToken = "";
let localChannelId = "";
let tokenCreationInProgress = false;
let serviceClient;

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(\`Example app listening at http://localhost:\${port}\`);
});

app.post("/${serviceIdPath}", async (req, res) => {
    const { value1, value2 } = req.body;
    if (!serviceClient) {
        serviceClient = await getServiceClient();
    }
    function waitForTokenCreation() {
        return new Promise((resolve, reject) => {
            const checking = setInterval(() => {
            if (!tokenCreationInProgress) {
                clearInterval(checking);
                resolve();
            }
            }, 3000);
        });
    }

    const createConcurrencyToken = async () => {
        try {
          tokenCreationInProgress = true;
          const { concurrencyToken, channelId } = await serviceClient.getConcurrencyTokenAndChannelId();
          tokenCreationInProgress = false;
          localConcurrencyToken = concurrencyToken;
          localChannelId = channelId;
        } catch (error) {
          throw error;
        }
    };

    const invokeAiService = async () => {
        try {
          serviceClient.setConcurrencyTokenAndChannelId(localConcurrencyToken, localChannelId);
          const response = await aiService(serviceClient, value1, value2);
          res.send({ output: response });
        } catch (error) {
          throw error;
        }
    };

    const run = async (shouldCreateNewToken = false) => {
        try {
          if (tokenCreationInProgress) await waitForTokenCreation();
          if (shouldCreateNewToken) await createConcurrencyToken();
          await invokeAiService();
        } catch (error) {
          let errorMessage = error.message.toLowerCase();
          if (
            errorMessage.includes("Usage Exceeded on channel Id".toLowerCase()) ||
            errorMessage.includes(
              "signed amount for token request cannot be greater than full amount in channel".toLowerCase()
            ) ||
            errorMessage.includes("signed amount for token request needs to be greater than last signed amount") ||
            errorMessage.includes("Insufficient funds in channel".toLowerCase())
          ) {
            await run(true);
          } else if (errorMessage.includes("already known")) {
            tokenCreationInProgress = true;
            await run();
          } else {
            res.status(500).send(error);
          }
        }
      };
      try {
        await run(!Boolean(localConcurrencyToken));
      } catch (error) {
        console.log("Service Failed", error.message);
      }
    });

`;
};
