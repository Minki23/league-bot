import { TextChannel } from "discord.js";
import { getUser, storeUser, updateUserLastMatchId } from "./db";
import { generateMessageToChannel, getLastMatchId, getMatchDetails } from "./lol/utils";

export const getUserPuuid = async (username: string, tag: string, token: string) => {
  const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    username
  )}/${encodeURIComponent(tag)}`;
  const res = await fetch(url, { headers: { "X-Riot-Token": token ?? "" } });
  if (!res.ok) throw new Error("Nie znaleziono gracza");
  const data = await res.json();
  return data.puuid;
};

export const notifyAboutLastUserMatch = async (
  username: string,
  tag: string,
  token: string,
  channel: TextChannel
) => {
  let user = await getUser(username);
  let userPuuid: string;
  let lastMatchIdFromDb: string | null = null;
  if (user) {
    userPuuid = user.puuid;
    lastMatchIdFromDb = user.lastMatchId;
  } else {
    userPuuid = await getUserPuuid(username, tag, token);
    await storeUser(username, userPuuid, "");
  }
  const currentMatchId = await getLastMatchId(userPuuid, token);

  if (currentMatchId !== lastMatchIdFromDb) {
    const matchDetails = await getMatchDetails(currentMatchId, token);
    const player = matchDetails.info.participants.find((p: any) => p.puuid === userPuuid);
    if (player.riotIdGameName === "lorekk") {
      await channel.send("Loris ty nie ważne co robisz to do dupy ci idzie");
    } else {
      const message = generateMessageToChannel(player.kills, player.assists, player.kills, player.win);
      await channel.send(
        `${player.riotIdGameName} zagrał grę ${matchDetails.info.gameMode} i miał ${message}, trollował ${player.championName} w grze?`
      );
    }
    await updateUserLastMatchId(username, currentMatchId);
  } else {
    console.log(`No new match for ${username}`);
  }
};