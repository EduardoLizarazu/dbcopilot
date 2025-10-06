import { TDbConnectionOutRequestDtoWithVbAndUser } from "@/core/application/dtos/dbconnection.dto";
import { TVbdOutRequestDto } from "@/core/application/dtos/vbd.dto";

export default function DbConnectionClient({
  initialData,
  vbd_splitter,
}: {
  initialData?: TDbConnectionOutRequestDtoWithVbAndUser;
  vbd_splitter: TVbdOutRequestDto[];
}) {
  return <div>DB Connection Client</div>;
}
