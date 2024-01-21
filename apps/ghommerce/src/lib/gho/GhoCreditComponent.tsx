import {
  Pool,
  InterestRate,
  EthereumTransactionTypeExtended,
} from "@aave/contract-helpers";
import { useMutation } from "@tanstack/react-query";
import { Address } from "wagmi";
import { useEthersSigner } from "@/lib/useEthersSigner.tsx";
import { InvoiceSchema } from "ghommerce-schema/src/api/invoice.api.schema.ts";
import { Button } from "@/components/ui/button.tsx";
import { BigNumber, Signer } from "ethers";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Card, CardContent, CardDescription, CardFooter, CardHeader} from "@/components/ui/card";

async function submitTransaction(props: {
  signer: Signer;
  tx: EthereumTransactionTypeExtended;
}) {
  const { signer, tx } = props;
  const extendedTxData = await tx.tx();
  const { from, ...txData } = extendedTxData;
  const txResponse = await signer.sendTransaction({
    ...txData,
    value: txData.value ? BigNumber.from(txData.value) : undefined,
  });
  return txResponse;
}

/**
 * https://docs.gho.xyz/developer-docs/overview#setup:~:text=contract%2Dhelpers%401.21.1-,borrow%E2%80%8B,delegation%20and%20passes%20in%20the%20delegators%20address%20in%20the%20onBehalfOf%20field.,-Sample%20Code%20(JavaScript
 * @constructor
 */
export const GhoCreditComponent = (props: {
  invoice: InvoiceSchema;
}) => {
  const signer = useEthersSigner();
  const borrow = useMutation({
    mutationFn: async (variables: {
      recipient: Address;
      amount: string;
    }) => {
      console.log("borrow 1", variables);
      const address = await signer?.getAddress();
      if (!address) throw new Error("No signer");
      if (!signer?.provider) throw new Error("No provider");
      const pool = new Pool(signer.provider, {
        POOL: "0x3De59b6901e7Ad0A19621D49C5b52cC9a4977e52", // Goerli GHO market
        WETH_GATEWAY: "0x9c402E3b0D123323F0FCed781b8184Ec7E02Dd31", // Goerli GHO market
      });
      console.log("pool 2 ", pool);
      const txs: EthereumTransactionTypeExtended[] = await pool.borrow({
        user: address,
        reserve: "0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211", // Goerli GHO market
        amount: variables.amount,
        interestRateMode: InterestRate.Variable,
        debtTokenAddress: "0x80aa933EfF12213022Fd3d17c2c59C066cBb91c7", // Goerli GHO market
      });
      console.log("txs 3", txs);
      const tx = submitTransaction({ signer, tx: txs[0] });
      console.log("tx 4 ", tx);
      return txs[0].tx();
    },
  });

  return (
    <div>
      <Button
        className="w-full mt-2 py-2 transition duration-300"
        variant={'default'}
        onClick={() =>
          borrow.mutate({
            recipient: props.invoice.store.wallet,
            amount: "1000000",
          })
        }
      >
        Borrow
      </Button>
    </div>
  );
};


export const GhoCreditModal = ( props: {
    invoice: InvoiceSchema;

}) => {

  const availableCredit = "1000000"; // New prop for available credit
  const maxCredit = "100000000"; // New prop for max credit

  return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Check GHO Credit</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🏦 AAVE GHO Credit</DialogTitle>
          </DialogHeader>
          <Card className="mt-4">
            <CardHeader>
              <CardDescription>
                Instead of selling your holdings, you can borrow against them, to pay your invoice.
                This is a great way to avoid capital gains tax, and keep your crypto, especially if you think it will go up in value.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mt-2">
                Instantly borrow GHO against your assets! No sale, no tax event. ✨
              </p>
              <div className="mt-4">
                <div className="flex justify-between items-center">
                  <span>Invoice Amount:</span>
                  <span className="font-bold">{props.invoice.amountDue} {props.invoice.currency}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Available Credit:</span>
                  <span className="font-bold">{availableCredit} GHO</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Potential Credit:</span>
                  <span className="font-bold">{maxCredit} GHO</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <GhoCreditComponent invoice={props.invoice} />
            </CardFooter>
            </Card>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};
