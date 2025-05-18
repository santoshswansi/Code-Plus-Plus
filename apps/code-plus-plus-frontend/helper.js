import useAuthStore from '@/store/useAuthStore';

export const getAccessToken = () => {
    const store = useAuthStore;
    return store.getState().accessToken;
}