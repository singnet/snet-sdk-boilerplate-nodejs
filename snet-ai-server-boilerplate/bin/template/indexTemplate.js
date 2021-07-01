exports.default = `
import aiService from "./aiService";

const main = async () => {
  /**
   * 4: Parse the proto get the output in the desired format
   */
  const response = await aiService();
  console.log("Get the data from the response object", response);
};

main();
`