import { useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import useSocket from "../hooks/useSocket";
import useNicknameStore from "../store/useNicknameStore";

export default function HomePage() {
  useSocket();

  useEffect(() => {
    useNicknameStore.getState().fetchNicknames();
  }, []);

  return <AppLayout />;
}
