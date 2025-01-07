"use client";
import TableData from "@/components/shared/TableData";
import TableHead from "@/components/shared/TableHead";
import Button from "@/components/shared/button";
import Pagination from "@/components/shared/Pagination";
import { CgClose } from "react-icons/cg";

const ViewPollModel = ({
  onClose,
  polls,
  onPageChange,
  pollPage,
  totalPollPages,
  meetingId,
}) => {
    const [isEnableModalOpen, setIsEnableModalOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);

  const handleEnableClick = (poll) => {
    setSelectedPoll(poll);
    setIsEnableModalOpen(true);
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-2 rounded-2xl w-[800px]">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">
            View Polls
          </h2>
          <Button onClick={onClose} variant="plain">
            <CgClose />
          </Button>
        </div>
        <div className="py-4 px-2">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg ">
              <thead className="border-b-[0.5px] border-solid border-custom-dark-blue-1">
                <tr>
                  <TableHead>Title</TableHead>
                  <TableHead>Total Questions</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Added Date</TableHead>
                  <TableHead>Last Updated On</TableHead>
                  <TableHead>Action</TableHead>
                </tr>
              </thead>
              <tbody>
                {polls?.map((poll) => (
                  <tr key={poll._id}>
                    <TableData>{poll.title}</TableData>
                    <TableData>{poll.questions.length}</TableData>
                    <TableData>{poll?.createdById?.firstName}</TableData>
                    <TableData>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      }).format(new Date(poll.createdAt))}
                    </TableData>
                    <TableData>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                      }).format(new Date(poll.updatedAt))}
                    </TableData>
                    <TableData>
                      <Button className="!text-blue-500" variant="plain"
                       onClick={() => handleEnableClick(poll)}
                      >
                        enable
                      </Button>
                    </TableData>
                  </tr>
                ))}

                {polls?.length == 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No Active Polls Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPollPages > 1 && (
              <div className="flex justify-end py-3">
                <Pagination
                  currentPage={pollPage}
                  totalPages={totalPollPages}
                  onPageChange={onPageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {isEnableModalOpen && (
        <EnablePollModal
          onClose={() => setIsEnableModalOpen(false)}
          poll={selectedPoll}
          meetingId={meetingId}
        />
      )}
    </div>
  );
};

export default ViewPollModel;
