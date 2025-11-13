import { ReadNlqQaHistoryById } from "@/_actions/nlq-qa/history/read-hisotory-by-id.action";
import { SingleChat } from "@/components/chat/single_chat";

type Params = { chatid: string };

export default async function ChatIdPage({ params }: { params: Params }) {
  console.log("Chat id: ", await params);
  const chatId = await params.chatid;

  const initial = await ReadNlqQaHistoryById({ nlqId: chatId });

  return (
    <>
      <SingleChat props={{ prompt: initial.data.question }} />
    </>
  );
}
