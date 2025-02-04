import "wagmi/window";
import { createConfig } from "wagmi";
import { createPublicClient, http } from "viem";
import { mainnet, polygon } from "viem/chains";
import { getDefaultConfig } from "connectkit";

const alchemyId = process.env.ALCHEMY_API_KEY;
const alchemyPolygonId = process.env.ALCHEMY_POLYGON_API_KEY;
const walletConnectProjectID = "6c37429d912cb97065107c0f849bc879";

const wagmiConfig = createConfig(
  getDefaultConfig({
    alchemyId,
    walletConnectProjectId: walletConnectProjectID,
    appName: "Crypto Defense",
    appDescription: "Isometric game. Build and Defence in the onchain crypto world",
    appUrl: "https://crypto-defense.vercel.app",
    appIcon: "https://crypto-defense.vercel.app//assets/logotype.png",
  }),
);

const client = createPublicClient({
  chain: mainnet,
  transport: http("https://eth-mainnet.g.alchemy.com/v2/" + alchemyId)
});

const polygonClient = createPublicClient({
  chain: polygon,
  transport: http("https://polygon-mainnet.g.alchemy.com/v2/" + alchemyPolygonId)
})

export { client, polygonClient, wagmiConfig };
