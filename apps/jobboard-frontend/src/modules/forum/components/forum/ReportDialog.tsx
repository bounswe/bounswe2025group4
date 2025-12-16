import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/components/ui/dialog"
import { Button } from "@shared/components/ui/button"
import { Textarea } from "@shared/components/ui/textarea"
import { Label } from "@shared/components/ui/label"
import { ShieldAlert } from "lucide-react"
import { useState } from "react"
import { createReport, mapReportReason } from "@shared/services/report.service"
import type { ReportableEntityType } from "@modules/admin/types/admin.types"
import { toast } from "react-toastify"
import { Loader2 } from "lucide-react"

interface ReportDialogProps {
  entityType: ReportableEntityType;
  entityId: number;
  entityName?: string;
  content?: string;
}

const ReportDialog = ({ entityType, entityId, entityName, content }: ReportDialogProps) => {
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please select a reason for your report")
      return
    }

    setIsSubmitting(true)
    try {
      await createReport({
        entityType,
        entityId,
        reasonType: mapReportReason(reason),
        description: description.trim() || undefined,
      })
      toast.success("Thank you for your report. Our moderators will review it shortly.")
      setOpen(false)
      setReason("")
      setDescription("")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
        <div className="space-y-4">
          {(content || entityName) && (
            <div className="my-4">
              <p className="text-sm font-medium mb-2">Content to be reported:</p>
              <p className="text-sm text-muted-foreground p-2 border rounded-md">
                {content || entityName}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Select a reason</option>
              <option value="SPAM">Spam</option>
              <option value="FAKE">Fake</option>
              <option value="OFFENSIVE">Offensive</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="MISINFORMATION">Misinformation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Please provide additional details about your report..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason.trim() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReportDialog
