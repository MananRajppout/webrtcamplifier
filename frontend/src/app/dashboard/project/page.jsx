"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Search from "@/components/singleComponent/Search";
import { MdAdd } from "react-icons/md";
import NoSearchResult from "@/components/singleComponent/NoSearchResult";
import ProjectTable from "@/components/singleComponent/ProjectTable";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/GlobalContext";
import Button from "@/components/shared/button";
import ProjectFilter from "@/components/singleComponent/ProjectFilter";

const Page = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useGlobalContext();

  const fetchProjects = async (
    userId,
    page = 1,
    searchQuery = "",
    filters = {}
  ) => {
    setLoading(true);
    try {
      // Determine API endpoint based on user role
      const endpoint =
        user?.role === "SuperAdmin" ||
        user?.role === "AmplifyAdmin" ||
        user?.role === "AmplifyTechHost"
          ? `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/project/getAllProjectsForAmplify`
          : `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/get-all/project/${userId}`;

      const response = await axios.get(endpoint, {
        params: {
          page,
          limit: 10,
          search: searchQuery,
          ...filters,
        },
      });

      setProjects(response.data.projects);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchProjects(user._id, page, searchTerm);
    }
  }, [user, page]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
    fetchProjects(user?._id, 1, term);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    // Add your status select logic here
  };

  const handleRefresh = () => {
    fetchProjects(page);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchProjects(user?._id, newPage);
  };

  // Add handleFilter function
  const handleFilter = (filters) => {
    setPage(1);
    fetchProjects(user?._id, 1, searchTerm, filters);
  };

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center">
      <div className="bg-white h-20 w-full border-b">
        <div className="bg-white py-5 border-b border-solid border-gray-400 w-full">
          <div className="md:px-10 flex justify-between items-center">
            {/* left div */}
            <div className="flex-grow text-center">
              <p className="text-2xl font-bold text-custom-teal">Projects</p>
            </div>
            {/* right div */}
            <div className="flex justify-end items-center gap-2">
              <Button
                children="Add new Project"
                type="submit"
                variant="default"
                icon={<MdAdd />}
                className="rounded-xl text-center shadow-[0px_3px_6px_#2976a54d] hidden md:flex w-[200px] py-3"
                onClick={() => router.push(`/dashboard/create-project`)}
              />
              <Button
                children=""
                type="submit"
                variant="default"
                icon={<MdAdd />}
                className="rounded-xl text-center py-3 mr-2 shadow-[0px_3px_6px_#2976a54d] md:hidden block pr-2 pl-3"
                onClick={() => router.push(`/dashboard/create-project`)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full bg-white">
        <div className="p-5 flex justify-Start items-center ">
          <Search onSearch={handleSearch} placeholder="Search project name" />
        </div>
        <ProjectFilter onFilter={handleFilter} />
      </div>

      <div className="flex-grow mx-auto w-full">
        {loading ? (
          <p className="text-center pt-20 font-bold text-5xl text-custom-orange-1">
            Loading...
          </p>
        ) : projects && projects.length > 0 ? (
          <ProjectTable
            projects={projects}
            fetchProjects={fetchProjects}
            user={user}
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        ) : (
          <NoSearchResult />
        )}
      </div>
    </div>
  );
};

export default Page;
