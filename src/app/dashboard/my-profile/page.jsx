"use client";
import React, { useState } from "react";
import Image from "next/image";
import userImage from "../../../../public/placeholder-image.png";
import realUserImage from "../../../../public/user.jpg";
import { RiPencilFill } from "react-icons/ri";
import { MdLockReset } from "react-icons/md";
import { IoTrashSharp } from "react-icons/io5";
import { FaBell } from "react-icons/fa";
import PasswordModal from "@/components/singleComponent/PasswordModal";
import DeleteModal from "@/components/singleComponent/DeleteModal";
import NotificationModal from "@/components/singleComponent/NotificationModal";
import Button from "@/components/shared/button";
import HeadingParagaraph from "@/components/shared/HeadingParagaraph";
import Link from "next/link";

const initialNotifications = [
  {
    id: 1,
    image: realUserImage,
    message:
      "You have been assigned a new project TCT Marathon Campaign by the admin.",
    time: "Yesterday at 9:30 AM",
    read: false,
  },
  {
    id: 3,
    image: realUserImage,
    message:
      "You have been assigned a new project TCT Marathon Campaign by the admin.",
    time: "Yesterday at 9:30 AM",
    read: false,
  },
  {
    id: 2,
    image: realUserImage,
    message:
      "Your Pop Culture Celebration meeting is about to start in the next 15 minutes. Please get your things ready!",
    time: "Last Thursday at 10:30 AM",
    read: true,
  },
];

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const handlePasswordChangeClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteModalOpen = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleNotificationModalOpen = () => {
    setIsNotificationModalOpen((prevState) => !prevState);
  };

  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="my_profile_main_section_shadow bg-[#fafafb] bg-opacity-90 h-full min-h-screen flex flex-col justify-center items-center relative">
      <div className="bg-white h-24 w-full">
        <div className="px-10 flex justify-between items-center pt-5">
          <div>
            <p className="text-2xl font-bold text-custom-teal">My Profile</p>
          </div>
          <div className="flex justify-center items-center gap-4">
            <Link href="/dashboard/edit-profile">
            <Button
              children="Edit Profile"
              type="submit"
              variant="secondary"
              icon={<RiPencilFill />}
              className="rounded-xl w-[200px] text-center py-3 shadow-[0px_3px_6px_#2976a54d] cursor-pointer"
            />
            </Link>
            <Button
              children="Change Password"
              type="submit"
              onClick={handlePasswordChangeClick}
              icon={<MdLockReset />}
              className="rounded-xl w-[200px] text-center py-3 shadow-[0px_3px_6px_#2976a54d] cursor-pointer"
            />
            <Button
              children="Delete My Account"
              type="submit"
              variant="primary"
              icon={<IoTrashSharp />}
              onClick={handleDeleteModalOpen}
              className="rounded-xl w-[200px] text-center py-3 shadow-[0px_3px_6px_#FF66004D] cursor-pointer"
            />
            <div className="relative">
              <div
                className="rounded-xl bg-[#f3f4f5] text-black p-4 cursor-pointer"
                onClick={handleNotificationModalOpen}
              >
                <FaBell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-[#ff2b2b] text-white text-xs font-bold rounded-full text-center pt-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              {isNotificationModalOpen && (
                <NotificationModal
                  onClose={handleNotificationModalOpen}
                  notifications={notifications}
                  markAllAsRead={markAllAsRead}
                  deleteNotification={deleteNotification}
                  clearAllNotifications={clearAllNotifications}
                  unreadCount={unreadCount}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow w-full px-10">
        <div className="pt-14">
          <div className="flex justify-start items-center gap-8">
            <Image
              src={userImage}
              alt="user image"
              height={70}
              width={70}
              className="rounded-full"
            />
            <div className="flex-grow">
              <h1 className="text-3xl font-semibold text-custom-dark-blue-1">
                Johnny Silver
              </h1>
              <p>ADMIN</p>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-custom-dark-blue-1 pt-14">
              Personal Details
            </h1>
            <div className="space-y-7 pt-7">
              <HeadingParagaraph heading="First Name" paragraph="Johnny" />
              <HeadingParagaraph heading="Last Name" paragraph="Silver" />
              <HeadingParagaraph
                heading="Email"
                paragraph="JohnnSilvie02@gmail.com"
              />
            </div>
          </div>
        </div>
      </div>
      {showModal && <PasswordModal onClose={handleCloseModal} />}
      {isDeleteModalOpen && <DeleteModal onClose={handleCloseDeleteModal} />}
    </div>
  );
};

export default Page;
