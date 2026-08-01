import { createFileRoute } from "@tanstack/react-router";
import { StaffShell } from "@/components/layout/staff-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/staff/attendance")({
  component: MarkAttendance,
});

function MarkAttendance() {
  const [marked, setMarked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleMarkAttendance = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMarked(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <StaffShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-border text-center max-w-md w-full">
          
          {!marked ? (
            <>
              <div className="h-20 w-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Mark Attendance</h2>
              <p className="text-muted-foreground mb-8">
                Click the button below to mark your attendance for today. Your current location and time will be recorded.
              </p>
              
              <Button 
                onClick={handleMarkAttendance} 
                disabled={loading}
                className="w-full h-12 text-lg bg-[#10703B] hover:bg-[#0e6133] text-white rounded-full"
              >
                {loading ? "Recording..." : "Punch In for Today"}
              </Button>
            </>
          ) : (
            <div className="animate-fade-in">
              <div className="h-20 w-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-700">Attendance Recorded!</h2>
              <p className="text-muted-foreground">
                You have successfully punched in for today at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.
              </p>
            </div>
          )}

        </div>
      </div>
    </StaffShell>
  );
}
