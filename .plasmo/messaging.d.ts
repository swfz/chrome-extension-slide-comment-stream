
import "@plasmohq/messaging"

interface MmMetadata {
	"batchConnector" : {}
	"connector" : {}
	"forwarder" : {}
}

interface MpMetadata {
	
}

declare module "@plasmohq/messaging" {
  interface MessagesMetadata extends MmMetadata {}
  interface PortsMetadata extends MpMetadata {}
}
