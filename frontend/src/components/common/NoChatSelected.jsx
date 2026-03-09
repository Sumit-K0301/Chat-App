import { MessageSquare } from "lucide-react";

export default function NoChatSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-base-200/50">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 animate-bounce">
        <MessageSquare className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">Welcome to Chat App</h2>
      <p className="text-base-content/60">Select a conversation to start messaging</p>
    </div>
  );
}
