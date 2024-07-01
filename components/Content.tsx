"use client";

import { useEffect, useMemo } from "react";
import { aptos, useABI } from "@/utils/aptosClient";
import { MODULE_NAME, ACCOUNT_ADDRESS, APT_COIN } from "@/constants";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { convertAmountFromOnChainToHumanReadable, truncateAddress, compareAddress } from "@/utils/helpers";
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Game = {
  ticket_amount: number;
  ticket_price: number;
  fee_rate: number;
  tickets: string[];
  claimed: boolean;
  winner: string;
  winner_index: number|null;
};

export function Content() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <Game gameId={1} />
        <Game gameId={2} />
        <Game gameId={3} />
      </div>
    );
}

export function Game({ gameId }: {gameId: number}) {
  const [submitSatus, setSubmitSatus] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [game, setGame] = useState<Game|null>(null);
  const { account, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();
  const progress = useMemo(() => {
    if (game) {
      return game.tickets.length * 100 / game.ticket_amount;
    }
    return 0;
  }, [game]);

  const UserInfo = () => {
    if (!account) return null;
    let tickets: string[] = [];
    if (game?.tickets)
      tickets = game.tickets;
    let userTicketInfo: number[] = [];
    tickets.forEach((addr, index) => {
      if(compareAddress(addr, account.address))
        userTicketInfo.push(index);
    });
    if (userTicketInfo.length)
      return <div>
        <h4 className="flex items-center"><span className="mr-2 font-bold flex h-2 w-2 translate-y-0.5 rounded-full bg-gray-600" /><span className="text-xl">my ticket numbers:</span> </h4>
        <p className="pl-3"><span className="font-bold">{userTicketInfo.join(", ")}</span></p>
      </div>
    return null;
  };

  const ClaimButton = () => {
    if (game && !game.claimed && account?.address === game.winner)
      return (
        <Button className="ml-4" onClick={claimHandler}>Claim Rewards</Button>
      );
    return null;
  };

  const WinnerInfo = () => {
    if (!game) return null;
    if (game.winner === "0x0") return null;
    return <div>
      <h4 className="flex items-center"><span className="mr-2 font-bold flex h-2 w-2 translate-y-0.5 rounded-full bg-gray-600" /><span className="text-xl">lucky number:</span> </h4>
      <p className="pl-3">
        <span className="text-green-600 font-bold">{game.winner_index??"null"}</span>
      </p>
      <h4 className="flex items-center"><span className="mr-2 font-bold flex h-2 w-2 translate-y-0.5 rounded-full bg-gray-600" /><span className="text-xl">winner:</span> </h4>
      <p className="pl-3">
        <span className="text-green-600 font-bold">{truncateAddress(game.winner)}</span>
      </p>
    </div>
  };

  const Participants = () => {
    if (!game) return null;
    return (<>
          <h4 className="flex items-center"><span className="mr-2 font-bold flex h-2 w-2 translate-y-0.5 rounded-full bg-gray-600" /><span className="text-xl">participants({game.tickets.length}):</span></h4>
          <ol className="list-decimal mx-4 mt-1">
          {
            game.tickets.map((addr, index) => (
              <li title={addr} key={addr + index}>{truncateAddress(addr)}</li>
            ))
          }
          </ol>
    </>);
  };

  const claimHandler = async () => {
    const typeArgs: any = [APT_COIN];
    const args: any = [gameId];
    const transaction: InputTransactionData =  {
      sender: account!.address,
      data: {
        function: `${ACCOUNT_ADDRESS}::${MODULE_NAME}::claim`,
        typeArguments: typeArgs,
        functionArguments: args,
      }
    };
    try {
      await signAndSubmitTransaction(transaction);
      toast({
        title: "rewards cliamed",
      })
    } catch(e) {
      console.error(e);
    }
  }

  const onSignAndSubmitTransaction = async () => {
    if (!account || !game) return;
    const typeArgs: any = [APT_COIN];
    const args: any = [gameId];
    const transaction: InputTransactionData =  {
      sender: account!.address,
      data: {
        function: `${ACCOUNT_ADDRESS}::${MODULE_NAME}::buy_ticket`,
        typeArguments: typeArgs,
        functionArguments: args,
      }
    };
    try {
      setSubmitting(true);
      await signAndSubmitTransaction(transaction);
      setSubmitSatus(!submitSatus);
    } catch(e) {
      console.error(e);
    }
    setSubmitting(false);
  }

  const fetchData = async () => {
    //const { latest_game_id } = await aptos.getAccountResource({
    //accountAddress: RESOURCE_ADDRESS,
    //resourceType: `${ACCOUNT_ADDRESS}::${MODULE_NAME}::GameInfo<${APT_COIN}>`
    //});
    const { abi } = await aptos.getAccountModule({ accountAddress: ACCOUNT_ADDRESS!, moduleName: MODULE_NAME! });
    const [ ticket_amount, ticket_price, fee_rate, tickets, claimed, winner, winner_index ] = await useABI(abi as any).view.game({
      typeArguments: [APT_COIN],
      functionArguments: [gameId]
    });
    setGame({
      ticket_amount: ticket_amount | 0,
      ticket_price: ticket_price | 0,
      fee_rate: fee_rate | 0,
      tickets,
      claimed,
      winner,
      winner_index: winner_index.vec.length ? winner_index.vec[0]|0 : null,
    });
    //console.log(ticket_amount, ticket_price, fee_rate, tickets, claimed, winner, winner_index);
    return winner;
  };

  useEffect(() => {
    fetchData();
    if (game?.winner && game.winner != "0x0") return;
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [submitSatus]);

  return (
    <div className="p-4">
      {!game && <div>loading</div>}
      {
        game &&
        <Card className="bg-gray-200 min-h-[100%]">
          <CardHeader>
            <CardTitle>Hunt <strong className="text-4xl">{convertAmountFromOnChainToHumanReadable(game.ticket_price*game.ticket_amount, 8)}</strong> APT</CardTitle>
            <CardDescription>you can win {convertAmountFromOnChainToHumanReadable(game.ticket_price*game.ticket_amount, 8)} APT with a bet of {convertAmountFromOnChainToHumanReadable(game.ticket_price, 8)} APT, winner will take all APT</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress > 0 ? progress : 1} title={progress + "%"} className="w-[100%]" />
            <div>total tickets: <strong>{game.ticket_amount}</strong>, current tickets: <strong>{game.tickets.length}</strong></div>
            <div className="flex items-center justify-center my-4"><Button onClick={ onSignAndSubmitTransaction } disabled={submitting || (!!game?.winner && game?.winner != "0x0")}><ReloadIcon className={cn("mr-2 h-4 w-4 animate-spin", submitting ? "" : "hidden")} />Buy Ticket</Button>
<ClaimButton />
            </div>
            <WinnerInfo />
            <UserInfo />
          </CardContent>
          <CardFooter>
          </CardFooter>
        </Card>
      }
    </div>
  );
}
