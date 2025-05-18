import api from "@/lib/api";
import useAuthStore from "@/store/useAuthStore";
import ky from "ky";
import { toast } from "sonner";
import { loginSchema, registerClientSchema } from "../../../packages/validators";
import { toastValidationErrors } from "@/helpers/toastValidationErrors";
import useGlobalStore from "@/store/useGlobalStore";
import { handleGetProjects } from "./project";
import { PAGINATION_LIMIT } from "@/constants";

const authStore = useAuthStore;
const globalStore = useGlobalStore;
export const refreshToken = async () => {
    const APIGatewayBaseURL = process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL;

    try{
        const res = await ky.get(APIGatewayBaseURL + '/auth/refresh', {
          credentials: "include",
        }).json()

        if(res.success){
          authStore.getState().setAccessToken(res.data.accessToken);
          authStore.getState().setName(res.data.name);
          authStore.getState().setUserId(res.data.userId);
          authStore.getState().setEmail(res.data.email);
          return res.data.accessToken;
        }else{
          authStore.getState().setAccessToken("");
          authStore.getState().setName("");
          authStore.getState().setEmail("");
          authStore.getState().setUserId("");
          return null;
        }
    }catch(err){
      authStore.getState().setAccessToken("");
      authStore.getState().setName("");
      authStore.getState().setEmail("");
      authStore.getState().setUserId("");
      return null
    }
};

export const handleLogin = async (email, password) => {
  try{
    const validation = loginSchema.safeParse({email, password});
    if(!validation.success){
      toastValidationErrors(validation);
      return;
    }

    const res = await api.post('auth/login', {
      json: { email, password },
      credentials: 'include',
    }).json();

    if(res.success){
      authStore.getState().setAccessToken(res.data.accessToken); 
      authStore.getState().setName(res.data.name);
      authStore.getState().setEmail(res.data.email);
      authStore.getState().setUserId(res.data.userId);

      globalStore.getState().setIsProjectsFetching(true);
      await handleGetProjects(globalStore.getState().currPage, PAGINATION_LIMIT);
      globalStore.getState().setIsProjectsFetching(false);

      toast.success(res.message);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    authStore.getState().setAccessToken("");
    authStore.getState().setName("");
    authStore.getState().setEmail("");
    authStore.getState().setUserId("");
    const errBody = await err.response.json();
    const message = errBody.message || "Login failed due to a network or server error";
    toast.error(message);
    return false;
  }
};

export const handleSignup = async (name, email, password) => {
  try{
    const validation = registerClientSchema.safeParse({name, email, password});
    if(!validation.success){
      toastValidationErrors(validation);
      return;
    }

    const res = await api.post('auth/register', {
      json: { name, email, password },
      credentials: 'include',
    }).json();

    if(res.success){
      authStore.getState().setAccessToken(res.data.accessToken); 
      authStore.getState().setName(res.data.name);
      authStore.getState().setEmail(res.data.email);
      authStore.getState().setUserId(res.data.userId);
      toast.success(res.message);
      return true;
    }else{
      throw new Error(res.message || "Something went wrong");
    }
  }catch(err){
    authStore.getState().setAccessToken("");
    authStore.getState().setName("");
    authStore.getState().setEmail("");
    authStore.getState().setUserId("");
    
    const errBody = await err.response.json();
    const message = errBody.message || "Signup failed due to a network or server error";
    toast.error(message);
    return false;
  }
};

export const handleIsLoggedIn = async () => {
  try{
    const res = await api.get('auth/is-logged-in').json();

    if(res.success){
      authStore.getState().setAccessToken(res.data.accessToken); 
      authStore.getState().setName(res.data.name);
      authStore.getState().setEmail(res.data.email);
      authStore.getState().setUserId(res.data.userId);
      return true;
    }else{
      authStore.getState().setAccessToken("");
      authStore.getState().setName("");
      authStore.getState().setEmail("");
      authStore.getState().setUserId("");
      return false;
    }
  }catch(err){
    authStore.getState().setAccessToken("");
    authStore.getState().setName("");
    authStore.getState().setEmail("");
    authStore.getState().setUserId("");
    return false;
  }
};

export const handleLogout = async () => {
  try{
    const res = await api.get("auth/logout").json();

    if(res.success){
      authStore.getState().setDefault();
      globalStore.getState().setDefault();
      return true;
    }else{
      throw new Error(res.message);
    }
  }catch(err){
        
    const errBody = await err.response.json();
    const message = errBody.message || "Logout failed";
    toast.error(message);
  }
};