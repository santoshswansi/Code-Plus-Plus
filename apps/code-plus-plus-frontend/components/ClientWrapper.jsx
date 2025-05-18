"use client";
import { handleIsLoggedIn } from "@/api/auth";
import { handleGetProjects } from "@/api/project";
import { PAGINATION_LIMIT } from "@/constants";
import useAuthStore from "@/store/useAuthStore";
import useGlobalStore from "@/store/useGlobalStore";
import { useEffect } from "react";

const ClientWrapper = ({ children }) => {
  const {currPage, setIsProjectsFetching} = useGlobalStore();
  const {isLogging, setIsLogging} = useAuthStore();

  useEffect(() => {
    const init = async () => {
      if(!isLogging){
        setIsLogging(true);
        const loggedIn = await handleIsLoggedIn();
        setIsLogging(false);

        if(loggedIn){
          setIsProjectsFetching(true);
          await handleGetProjects(currPage, PAGINATION_LIMIT);
          setIsProjectsFetching(false);
        }
      }
    };

    init();
  }, []);

  return <>{children}</>;
}

export default ClientWrapper;