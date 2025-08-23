
import { DataWritten as DataWrittenEvent } from "../generated/DataVault/DataVault";
import { Record } from "../generated/schema";

export function handleDataWritten(event: DataWrittenEvent): void {
  const id = event.transaction.hash.toHex() + ":" + event.logIndex.toString();
  let rec = new Record(id);
  rec.sender = event.params.sender;
  rec.content = event.params.content;
  rec.txHash = event.transaction.hash;
  rec.blockNumber = event.block.number;
  rec.timestamp = event.block.timestamp;
  rec.save();
}
