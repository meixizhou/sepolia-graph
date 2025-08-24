import { DataWritten as DataWrittenEvent, EthTransferred as EthTransferredEvent } from "../generated/DataVault/DataVault"
import { Record, Transfer } from "../generated/schema"

export function handleDataWritten(event: DataWrittenEvent): void {
  const id = event.transaction.hash.toHex() + ":" + event.logIndex.toString()
  let rec = new Record(id)

  rec.sender = event.params.sender
  rec.dataId = event.params.id
  rec.content = event.params.content
  rec.timestamp = event.params.timestamp

  rec.txHash = event.transaction.hash
  rec.blockNumber = event.block.number

  rec.save()
}
export function handleEthTransferred(event: EthTransferredEvent): void {
  let entity = new Transfer(event.transaction.hash.toHex() + ":" + event.logIndex.toString());
  entity.sender = event.params.sender;
  entity.to = event.params.to;
  entity.amount = event.params.amount;
  entity.timestamp = event.block.timestamp;
  entity.save();
}