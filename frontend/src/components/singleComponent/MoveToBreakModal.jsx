'use client'

import { useCallback, useState } from "react";
import Button from "../shared/button";
import Dropdown from "../shared/Dropdown";

const MoveToBreakModal = ({ onClose, breakoutRooms,userToMoveBreak,handleMoveParticipant}) => {
    const [selected,setSelected] = useState(breakoutRooms[0]);

    const handleMove = useCallback(() => {
        if(selected){
            handleMoveParticipant(selected,userToMoveBreak);
            onClose();
        }else{
            alert('Please Select Room')
        }
    },[selected])
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-8 rounded-2xl w-[420px]">
        <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">Move to Breakout Room</h2>

      <div className="my-8">
      <Dropdown
            options={breakoutRooms}
            selectedOption={selected || "Select Room"}
            onSelect={(option) => {
              setSelected(option)
            }}
            className="w-full mt-2 z-20"
        />
      </div>

        <div className='flex justify-end items-center gap-4'>
        <Button
            children="Cancel"
            type="button"
            variant='cancel'
            onClick={onClose}
            className="rounded-xl text-center py-1 px-7 shadow-[0px_3px_6px_#031F3A59] "
          />
          <Button
            children="Move"
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

export default MoveToBreakModal;
