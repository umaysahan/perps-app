import { Connection, PublicKey } from '@solana/web3.js';
import {
    buildWithdrawMarginTx,
    getUserMarginBucket,
} from '@crocswap-libs/ambient-ember';

export interface WithdrawServiceResult {
    success: boolean;
    error?: string;
    signature?: string;
    confirmed?: boolean;
}

export interface AvailableWithdrawBalance {
    balance: number; // raw balance
    decimalized: number; // decimalized balance
}

/**
 * Service for handling Solana withdraw transactions
 */
export class WithdrawService {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    /**
     * Get available balance to withdraw from margin bucket
     * @param userPublicKey - User's public key
     * @returns Promise<AvailableWithdrawBalance | null>
     */
    async getAvailableWithdrawBalance(
        userPublicKey: PublicKey,
    ): Promise<AvailableWithdrawBalance | null> {
        try {
            console.log(
                '🔍 Fetching available withdraw balance for:',
                userPublicKey.toString(),
            );
            console.log('📡 Connection endpoint:', this.connection.rpcEndpoint);

            let marginBucket;
            try {
                // Add timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(
                        () =>
                            reject(
                                new Error(
                                    'getUserMarginBucket timeout after 10 seconds',
                                ),
                            ),
                        10000,
                    );
                });

                marginBucket = await Promise.race([
                    getUserMarginBucket(this.connection, userPublicKey),
                    timeoutPromise,
                ]);
                console.log('✅ getUserMarginBucket call completed');
            } catch (marginError) {
                console.error(
                    '❌ Error calling getUserMarginBucket:',
                    marginError,
                );
                // Don't throw, just return 0 balance
                return { balance: 0, decimalized: 0 };
            }

            if (!marginBucket) {
                console.log('⚠️ No margin bucket found for user');
                return { balance: 0, decimalized: 0 };
            }

            // Don't use JSON.stringify with BigInt values
            console.log('📊 Margin bucket data:', marginBucket);
            console.log('📊 Calculations:', marginBucket.calculations);
            console.log(
                '📊 All margin bucket keys:',
                Object.keys(marginBucket),
            );

            // If calculations exist, log its keys
            if (marginBucket.calculations) {
                console.log(
                    '📊 Calculations keys:',
                    Object.keys(marginBucket.calculations),
                );
                // Log each calculation value separately to handle BigInts
                for (const [key, value] of Object.entries(
                    marginBucket.calculations,
                )) {
                    console.log(
                        `  - ${key}:`,
                        value?.toString ? value.toString() : value,
                    );
                }
            }

            // Get available to withdraw from calculations
            // Try different possible field names
            let availableToWithdraw =
                marginBucket.calculations?.collateralAvailableToWithdraw ||
                marginBucket.collateralAvailableToWithdraw ||
                marginBucket.availableToWithdraw ||
                marginBucket.calculations?.availableToWithdraw ||
                marginBucket.calculations?.available_to_withdraw ||
                0;

            console.log('💰 Raw available to withdraw:', availableToWithdraw);
            console.log(
                '💰 Type of available to withdraw:',
                typeof availableToWithdraw,
            );

            // Convert BigInt to number if necessary
            if (typeof availableToWithdraw === 'bigint') {
                availableToWithdraw = Number(availableToWithdraw);
                console.log(
                    '💰 Converted from BigInt to number:',
                    availableToWithdraw,
                );
            }

            // Convert to decimalized value (assuming 6 decimals for USD)
            const decimalized = availableToWithdraw / Math.pow(10, 6);

            console.log('💵 Decimalized available to withdraw:', decimalized);

            return {
                balance: availableToWithdraw,
                decimalized,
            };
        } catch (error) {
            console.error(
                '❌ Error fetching available withdraw balance:',
                error,
            );
            console.error('Error details:', {
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace',
                userPublicKey: userPublicKey.toString(),
            });
            return null;
        }
    }

    /**
     * Validate withdraw amount
     * @param amount - Amount to withdraw (in decimalized form)
     * @returns Validation result
     */
    validateWithdrawAmount(amount: number): {
        isValid: boolean;
        message?: string;
    } {
        if (!amount || amount <= 0) {
            return { isValid: false, message: 'Invalid withdraw amount' };
        }

        // No minimum for withdrawals
        return { isValid: true };
    }

    /**
     * Build a withdraw transaction
     * @param amount - Amount to withdraw (in decimalized form)
     * @param user - User public key (session key)
     * @param actor - Actor public key (optional, defaults to user)
     * @returns Promise<Transaction>
     */
    private async buildWithdrawTransaction(
        amount: number,
        user: PublicKey,
        actor?: PublicKey,
        target?: PublicKey,
    ) {
        try {
            console.log('🔨 Building withdraw transaction with params:', {
                amount,
                user: user.toString(),
                userLength: user.toString().length,
                actor: actor?.toString() || 'same as user',
                actorLength: (actor || user).toString().length,
                target: target?.toString() || 'not provided',
                targetLength: target ? target.toString().length : 'N/A',
            });

            // Validate public keys
            if (user.toString().length < 32 || user.toString().length > 44) {
                throw new Error(
                    `Invalid user public key length: ${user.toString().length}`,
                );
            }
            if (
                actor &&
                (actor.toString().length < 32 || actor.toString().length > 44)
            ) {
                throw new Error(
                    `Invalid actor public key length: ${actor.toString().length}`,
                );
            }
            if (
                target &&
                (target.toString().length < 32 || target.toString().length > 44)
            ) {
                throw new Error(
                    `Invalid target public key length: ${target.toString().length}`,
                );
            }

            // Convert decimalized amount to non-decimalized (multiply by 10^6)
            // Use BigInt to match what the SDK expects
            const nonDecimalizedAmount = BigInt(
                Math.floor(amount * Math.pow(10, 6)),
            );
            console.log(
                '💰 Non-decimalized amount:',
                nonDecimalizedAmount.toString(),
            );
            console.log(
                '💰 Non-decimalized amount type:',
                typeof nonDecimalizedAmount,
            );

            // Build the transaction using the SDK
            const transaction = await buildWithdrawMarginTx(
                this.connection,
                nonDecimalizedAmount,
                user,
                {
                    actor: actor || user,
                    target: target, // User's wallet for PDA construction
                },
            );

            console.log('✅ Withdraw transaction built successfully');
            console.log('📋 Transaction details:', {
                numInstructions: transaction.instructions.length,
                instructions: transaction.instructions.map((ix) => ({
                    programId: ix.programId.toString(),
                    keys: ix.keys.map((key) => ({
                        pubkey: key.pubkey.toString(),
                        isSigner: key.isSigner,
                        isWritable: key.isWritable,
                    })),
                    dataLength: ix.data.length,
                })),
            });

            return transaction;
        } catch (error) {
            console.error('❌ Error building withdraw transaction:', error);
            console.error('Build transaction error details:', {
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace',
                amount,
                user: user.toString(),
            });
            throw new Error(`Failed to build withdraw transaction: ${error}`);
        }
    }

    /**
     * Execute a withdraw by building and sending the transaction
     * @param amount - Amount to withdraw (in decimalized form)
     * @param sessionPublicKey - Session public key (for transaction building)
     * @param userWalletKey - User's actual wallet public key (for PDA construction)
     * @param sendTransaction - Function to send the transaction (from Fogo session)
     * @returns Promise<WithdrawServiceResult>
     */
    async executeWithdraw(
        amount: number,
        sessionPublicKey: PublicKey,
        userWalletKey: PublicKey,
        sendTransaction: (instructions: any[]) => Promise<any>,
    ): Promise<WithdrawServiceResult> {
        try {
            // Validate amount first
            const validation = this.validateWithdrawAmount(amount);
            if (!validation.isValid) {
                // Note: Notifications are handled by the component using NotificationStore
                return {
                    success: false,
                    error: validation.message,
                };
            }

            // Transaction pending notification handled by component

            // Build the transaction
            // Following the deposit pattern: wallet key as user, session key as actor
            const transaction = await this.buildWithdrawTransaction(
                amount,
                userWalletKey, // user (wallet key)
                sessionPublicKey, // actor (session key for signing)
                undefined, // target (not needed for withdraw?)
            );

            // Extract instructions from the transaction
            const instructions = transaction.instructions;

            console.log('📤 Sending withdraw transaction:');
            console.log('  - Instructions to send:', instructions.length);
            console.log(
                '  - Instruction details:',
                instructions.map((ix, index) => ({
                    index,
                    programId: ix.programId.toString(),
                    keysCount: ix.keys.length,
                    dataLength: ix.data.length,
                    firstFewDataBytes: Array.from(ix.data.slice(0, 8)),
                })),
            );

            // Send the transaction using Fogo session (pass raw instructions like deposit does)
            console.log('  - Calling sendTransaction with instructions...');
            console.log(
                '  - sendTransaction function type:',
                typeof sendTransaction,
            );
            console.log('  - Instructions array:', instructions);
            const result = await sendTransaction(instructions);

            console.log('📥 Transaction result:', result);

            // Extract signature from result
            let signature: string | undefined;

            if (typeof result === 'string') {
                signature = result;
            } else if (result && typeof result === 'object') {
                // Check various possible signature locations
                signature =
                    result.signature ||
                    result.txid ||
                    result.hash ||
                    result.transactionSignature;

                // If still not found, check for a nested result object
                if (!signature && result.result) {
                    signature =
                        result.result.signature ||
                        result.result.txid ||
                        result.result;
                }
            }

            console.log('🔑 Extracted signature:', signature);

            // Track transaction confirmation
            if (signature) {
                console.log(
                    '🔍 Starting transaction tracking for signature:',
                    signature,
                );

                // Wait for confirmation
                const isConfirmed = await this.trackTransactionConfirmation(
                    signature,
                    amount,
                );

                if (isConfirmed) {
                    // Note: Success notification should be handled by the component

                    return {
                        success: true,
                        signature,
                        confirmed: true,
                    };
                } else {
                    return {
                        success: false,
                        error: 'Transaction failed or timed out',
                        signature,
                        confirmed: false,
                    };
                }
            } else {
                console.warn(
                    '⚠️ No signature returned from sendTransaction - cannot track confirmation',
                );
                return {
                    success: false,
                    error: 'No transaction signature received',
                };
            }
        } catch (error) {
            console.error('❌ Error executing withdraw:', error);
            console.error('Execute withdraw error details:', {
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace',
                name: error instanceof Error ? error.name : 'Unknown',
                cause:
                    error instanceof Error && 'cause' in error
                        ? error.cause
                        : 'No cause',
                amount,
                sessionPublicKey: sessionPublicKey.toString(),
            });

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';

            // Note: Error notification should be handled by the component

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Track transaction confirmation on-chain
     * @param signature - Transaction signature
     * @param amount - Amount being withdrawn
     * @returns Promise<boolean> - true if confirmed, false if failed or timed out
     */
    private async trackTransactionConfirmation(
        signature: string,
        amount: number,
    ): Promise<boolean> {
        return new Promise((resolve) => {
            const maxRetries = 30; // 60 seconds total (2 seconds per check)
            let retryCount = 0;

            const checkConfirmation = async () => {
                try {
                    retryCount++;
                    console.log(
                        `🔍 Checking transaction status (attempt ${retryCount}/${maxRetries})...`,
                    );

                    const status =
                        await this.connection.getSignatureStatus(signature);

                    if (status && status.value) {
                        console.log(
                            '📊 Transaction status:',
                            status.value.confirmationStatus,
                        );

                        if (status.value.err) {
                            console.error(
                                '❌ Transaction failed on-chain:',
                                status.value.err,
                            );
                            // Error notification handled by component
                            resolve(false);
                            return;
                        }

                        if (
                            status.value.confirmationStatus === 'confirmed' ||
                            status.value.confirmationStatus === 'finalized'
                        ) {
                            console.log('✅ Transaction confirmed on-chain!');

                            // Get full transaction details
                            try {
                                const txDetails =
                                    await this.connection.getTransaction(
                                        signature,
                                        {
                                            commitment: 'confirmed',
                                            maxSupportedTransactionVersion: 0,
                                        },
                                    );
                                console.log(
                                    '📋 Full transaction details:',
                                    txDetails,
                                );

                                if (txDetails) {
                                    console.log(
                                        '💰 Transaction confirmed successfully:',
                                        {
                                            signature,
                                            slot: txDetails.slot,
                                            blockTime: txDetails.blockTime,
                                            fee: txDetails.meta?.fee,
                                            computeUnitsConsumed:
                                                txDetails.meta
                                                    ?.computeUnitsConsumed,
                                            preBalances:
                                                txDetails.meta?.preBalances,
                                            postBalances:
                                                txDetails.meta?.postBalances,
                                        },
                                    );
                                }
                            } catch (detailsError) {
                                console.warn(
                                    '⚠️ Could not fetch full transaction details:',
                                    detailsError,
                                );
                            }

                            resolve(true);
                            return;
                        }
                    }

                    // Continue checking if not confirmed yet
                    if (retryCount < maxRetries) {
                        setTimeout(checkConfirmation, 2000); // Check every 2 seconds
                    } else {
                        console.warn(
                            '⏱️ Transaction confirmation timeout for signature:',
                            signature,
                        );
                        // Error notification handled by component
                        resolve(false);
                    }
                } catch (error) {
                    console.error(
                        '❌ Error checking transaction status:',
                        error,
                    );
                    if (retryCount < maxRetries) {
                        setTimeout(checkConfirmation, 2000); // Retry on error
                    } else {
                        // Error notification handled by component
                        resolve(false);
                    }
                }
            };

            // Start checking immediately
            checkConfirmation();
        });
    }
}
