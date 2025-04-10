import { useDispatch, useSelector } from 'react-redux';
import { showLoading, hideLoading, resetLoading } from '../store/slices/loadingSlice';

export const useLoading = () => {
    const dispatch = useDispatch();
    const isLoading = useSelector((state) => state.loading.isLoading);

    const setLoading = (loading) => {
        if (loading) {
            dispatch(showLoading());
        } else {
            dispatch(hideLoading());
        }
    };

    const reset = () => {
        dispatch(resetLoading());
    };

    return { isLoading, setLoading, reset };
};