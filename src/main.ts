import{ createServer} from "node:http";
import{ createYoga} from"graphql-yoga";
import{ schema} from "./schema";
import { createContext, type AppContext } from "./context";


const yoga = createYoga<{}, AppContext>({
  schema,
  context: createContext,
});
const server=createServer(yoga);
server.listen(4000, () =>{
console.info(`
Server is running on 
http://localhost:4000/graphql`
);
});

