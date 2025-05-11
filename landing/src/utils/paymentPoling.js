import { useCallback, useState, useEffect } from "react";
import { PAYMENT_STATUS, POLLING_CONFIG } from "../common/Constant";
import orderService from "../services/order.service";

export const usePaymentPolling = (onSuccess, onFailure) => {
    const [isPolling, setIsPolling] = useState(false);
    const [currentTransactionId, setCurrentTransactionId] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.DRAFT);
    const [error, setError] = useState(null);

    const checkTransactionStatus = useCallback(async (transactionId) => {
        try {
            const response = await orderService.check_payment_status(transactionId);

            if (response.isSuccess && response.data.status !== PAYMENT_STATUS.DRAFT) {
                setPaymentStatus(response.data.status);
                setIsPolling(false);

                if (response.data.status === PAYMENT_STATUS.SUCCESSED) {
                    onSuccess?.(response.data);
                } else if (response.data.status === PAYMENT_STATUS.FAILED) {
                    setError('Payment failed');
                    onFailure?.(response.data);
                }
            }
        } catch (err) {
            setError(err.message);
            setIsPolling(false);
            onFailure?.(err.message);
        }
    }, [onSuccess, onFailure]);

    useEffect(() => {
        let pollingInterval;
        let timeoutId;

        if (isPolling && currentTransactionId) {
            checkTransactionStatus(currentTransactionId);

            timeoutId = setTimeout(() => {
                setIsPolling(false);
                setError('Payment timeout');
                onFailure?.('Payment timeout');
            }, POLLING_CONFIG.TIMEOUT);

            // Đặt interval để tiếp tục polling
            pollingInterval = setInterval(() => {
                checkTransactionStatus(currentTransactionId);
            }, POLLING_CONFIG.INTERVAL);
        }

        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isPolling, currentTransactionId, checkTransactionStatus]);

    const handlePayment = useCallback((paymentData, type = null) => {
        orderService.create_payment_url(paymentData)
            .then(response => {
                if (response.isSuccess) {
                    setCurrentTransactionId(response.data.orderId);
                    setIsPolling(true);
                    setPaymentStatus(PAYMENT_STATUS.DRAFT);
                    setError(null);

                    window.open(response.data.payUrl, '_blank');
                }
            })
            .catch(error => {
                setError(error.message);
                onFailure?.(error.message);
            });
    }, []);

    return {
        handlePayment,
        paymentStatus,
        error,
        isPolling
    };
};