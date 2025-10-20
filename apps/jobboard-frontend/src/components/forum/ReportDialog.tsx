import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ShieldAlert } from "lucide-react"
import { useState } from "react"

interface ReportDialogProps {
  content: string
}

const ReportDialog = ({ content }: ReportDialogProps) => {
  const [reason, setReason] = useState("")
  const [open, setOpen] = useState(false)

  const handleSubmit = () => {
    console.log("Reported content:", content)
    console.log("Reason:", reason)
    alert("Thank you for your report. Our moderators will review it shortly.")
    setOpen(false)
    setReason("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <ShieldAlert className="h-5 w-5 text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            You are about to report the following content. Please provide a reason for your report.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <p className="text-sm font-medium">Content to be reported:</p>
          <p className="text-sm text-muted-foreground p-2 border rounded-md">{content}</p>
        </div>
        <Textarea
          placeholder="Please provide a reason for your report..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!reason.trim()}>Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReportDialog
