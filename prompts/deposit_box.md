I'd like to implement logic from that's currently mocked up and not present in the deposit modal. Right now the modal uses a hardcoded value of 483167, and actually clicking deposit doesn't send a Solana transaction.

The @crocswap/ambient-ember SDK provides functionality to provide both of these functions.
With the user's connected session, this SDK provides a function:

xport async function getUserTokenBalance(
connection: Connection,
userWallet: PublicKey,
mint: PublicKey = USD_MINT,
options: QueryOptions = {}
)

Here connection is the connection from the fogo session object. UserWallet is the connected public key. Querying this should return a value equal to the non-decimialized balance in the user's wallet. The depoist function displays and inputs the decimalized value (which we can assume is always 10^6).

When the user enters a deposit, the system should manually check that the value is greater than
or equal to 10. If it's not the depoist box should grey out and say "Minimum deposit value is $10".

For a valid depoist value, the button click shoudl call

export async function buildDepositMarginTx(
connection: Connection,
amount: bigint,
user: PublicKey,
options: DepositMarginOptions = {}
): Promise<Transaction>

From the SDK. The instruction list from this transaction object should be sent to the fogo session send_transaction function. (You can see a simialr example with the ping transcation in the repo).

Finally the transaction should be monitored and the notification toast should pop up and notify if and when the transaction succeeds or failed.

When implementing the code, try to use best software engineering practices. Don't just shoehorn into existing functions/modules. Try to keep separation of concerns and make code
clean and maintainable. Don't be afraid to create new source files where logical and try to
reuse code.

Let me know if you have any questions, need points of clarification or want to discuss about the design or plan. If not, let's get started.
