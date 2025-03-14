import Button from "@/components/shared/button";
import TableData from "@/components/shared/TableData";
import TableHead from "@/components/shared/TableHead";
import axios from "axios";
import toast from "react-hot-toast";
import Pagination from "@/components/shared/Pagination";
import { useCallback, useEffect, useState } from "react";
import WatchRecording from "@/components/WatchRecording";


export function bytesToMbs(size) {
  return (size / (1024 ** 2)).toFixed(2);
}

const RepositoryTab = ({
  repositories,
  selectedRepositoryMeetingTab,
  selectedDocAndMediaTab,
  fetchRepositories,
  projectId,
  totalAllRepoPages,
  totalMeetingRepoPages,
  fetchRepositoriesByMeetingId,
  projectStaus,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(totalAllRepoPages);

  const [watchRecordingVideo, setWatchRecordingVideo] = useState(null);

  const fetchRepositoriesData = async (page, isPageChange) => {
    if (!isPageChange) {
      setCurrentPage(1);
      page = 1;
    }
    if (selectedRepositoryMeetingTab === "All") {
      const response = await fetchRepositories(projectId, page);
      setTotalPages(totalAllRepoPages);
    } else if (selectedRepositoryMeetingTab) {
      const response = await fetchRepositoriesByMeetingId(
        selectedRepositoryMeetingTab._id,
        page
      );
      setTotalPages(totalMeetingRepoPages);
    }
  };

  useEffect(() => {
    fetchRepositoriesData(currentPage, false);
  }, [selectedRepositoryMeetingTab]);

  const handlePageChange = (page) => {
    fetchRepositoriesData(page, true);
    setCurrentPage(page);
  };

  const renameFile = async (id) => {
    try {
      const newFileName = prompt("Enter the new file name:");
      if (!newFileName) return;
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/upload/rename/${id}`,
        {
          fileName: newFileName,
        }
      );

      if (response.status === 200) {
        toast.success(`${response.data.message}`);
        fetchRepositories(projectId);
      } else {
        toast.error(`${response.data.message}`);
      }
    } catch (error) {
      toast.error(`${error.response.data.message}`);
      console.error("Error renaming file:", error);
    }
  };

  const deleteFile = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/upload/delete/${id}`
      );

      if (response.status === 200) {
        fetchRepositories(projectId);
        toast.success(`${response.data.message}`);
      } else {
        toast.error(`${response.data.message}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error(`${error.response.data.message}`);
    }
  };

  const downloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (typeof window !== 'undefined') {
          window.open(url, '__blank');
        }
        throw new Error("Failed to fetch the file");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download the file.");
    }
  };


  const openWatchDialog = useCallback((transcription, video) => {
    setWatchRecordingVideo({ transcription, video });
  }, []);

  const filteredRepositories =
    selectedRepositoryMeetingTab === "All"
      ? repositories
      : selectedRepositoryMeetingTab
        ? repositories.filter(
          (repo) => repo.meetingId === selectedRepositoryMeetingTab._id
        )
        : [];

  const displayRepositories = filteredRepositories.filter((repo) => {
    if (selectedDocAndMediaTab === "Documents") {
      return repo.file.mimetype === "application/pdf";
    } else if (selectedDocAndMediaTab === "Media") {
      return repo.file.mimetype !== "application/pdf";
    }
    return true;
  });

  const renderContent = () => {
    if (displayRepositories.length === 0) {
      return (
        <p className="text-center pt-5 font-bold text-custom-orange-1">
          No {selectedDocAndMediaTab.toLowerCase()} found for this meeting.
        </p>
      );
    }

    return (
      <div className="overflow-x-auto">
        {projectStaus === "Closed" ? (
          <div className="flex justify-center items-center pt-10 font-bold text-custom-dark-blue-2">
            Files cannot be accessed in close project.
          </div>
        ) : (
          <>
            <table className="min-w-full bg-white shadow-md rounded-lg ">
              <thead className="border-b-[0.5px] border-solid border-custom-dark-blue-1">
                <tr>
                  <TableHead>File Name</TableHead>
                  <TableHead>File Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Added By</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Action</TableHead>
                </tr>
              </thead>
              <tbody>
                {displayRepositories?.map((repo) => (
                  <tr key={repo._id}>
                    <TableData>{repo.file.name}</TableData>
                    <TableData>{repo.file.mimetype}</TableData>
                    <TableData>{bytesToMbs(repo.file.size)} MB</TableData>
                    <TableData>{repo.addedBy || 'Unkown'}</TableData>
                    <TableData>{repo.role}</TableData>
                    <TableData>
                      <div className="flex flex-col justify-center items-center gap-1">
                        <Button
                          children={"Rename"}
                          type="button"
                          variant="plain"
                          className=" text-xs px-2 font-semibold"
                          onClick={() => renameFile(repo._id)}
                        ></Button>
                        <Button
                          children={"Delete"}
                          type="button"
                          variant="plain"
                          className=" text-xs px-2   font-semibold"
                          onClick={() => deleteFile(repo._id)}
                        ></Button>

                        {
                          repo.file.public_id != "recording_server" &&
                          <Button
                            onClick={() =>
                              downloadFile(repo.file.url, repo.file.name)
                            }
                            children={"Download"}
                            type="button"
                            variant="plain"
                            className=" text-xs px-2 font-semibold"
                          ></Button>
                        }

                        {
                          repo.file.public_id == "recording_server" &&
                          <Button
                            onClick={() =>
                              downloadFile(repo.file.url, repo.file.name)
                            }
                            children={"Download Recording"}
                            type="button"
                            variant="plain"
                            className=" text-xs px-2 font-semibold"
                          ></Button>
                        }

                        {
                          repo.file.public_id == "recording_server" &&
                          <Button
                            onClick={() =>
                              downloadFile(repo.file.transcribtion, `${repo.file.name?.replace("mp4", "")}-trancription.txt`)
                            }
                            children={"Download Transcription"}
                            type="button"
                            variant="plain"
                            className=" text-xs px-2 font-semibold"
                          ></Button>
                        }

                        {
                          repo.file.public_id == "recording_server" &&
                          <Button
                            onClick={() =>
                              openWatchDialog(repo.file.words, repo.file.url)
                            }
                            children={"Watch Recording"}
                            type="button"
                            variant="plain"
                            className=" text-xs px-2 font-semibold"
                          ></Button>
                        }

                      </div>
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end py-3">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    );
  };




  return (
    <>

      <div>
        {selectedRepositoryMeetingTab ? (
          renderContent()
        ) : (
          <p className="text-center pt-5 font-bold text-custom-orange-1">
            Please select a meeting and a tab (Documents or Media) to view
            repository items.
          </p>
        )}
      </div>
      

      {
        watchRecordingVideo != null &&
        <WatchRecording transcriptionurl={watchRecordingVideo.transcription} videourl={watchRecordingVideo.video} onClose={() => setWatchRecordingVideo(null)}/>
      }

    
    </>
  );
};

export default RepositoryTab;
