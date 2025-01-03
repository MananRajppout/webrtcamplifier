'use client'

import Button from "../shared/button";

const BreakoutRoomMoveModel = ({ onClose, roomDetails,handleMove}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-8 rounded-2xl w-[600px]">
        <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">
          The moderator has assigned you to the Breakout Room "{roomDetails && roomDetails?.name}". Would you like to join this room now?
        </h2>

        <div className='flex justify-end items-center gap-4 mt-10'>
          <Button
            children="Stay in Main Room"
            type="button"
            variant='cancel'
            onClick={onClose}
            className="rounded-xl text-center py-1 px-7 shadow-[0px_3px_6px_#031F3A59] "
          />
          <Button
            children="Join Now"
            type="button"
            variant='primary'
            onClick={handleMove}
            className="rounded-xl text-center py-1 px-10 shadow-[0px_3px_6px_#031F3A59] "
          />
        </div>
      </div>
    </div>
  );
};

export default BreakoutRoomMoveModel;
