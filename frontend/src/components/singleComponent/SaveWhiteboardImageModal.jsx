'use client'

import { useCallback, useState } from "react";
import Button from "../shared/button";
import Dropdown from "../shared/Dropdown";
import toast from "react-hot-toast";

const SaveWhiteBoardImageModel = ({ onClose,name,setName,handleSaved,uploadProgress}) => {
    


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
      <div className="bg-white p-8 rounded-2xl w-[420px]">
        <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">Upload On Document Hub</h2>

        <div className="my-8">
        <input className="py-2 px-4 rounded-md " placeholder="example-filename.png" value={name} onChange={(e) => setName(e.target.value)}/>
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
            children={uploadProgress != 0 ? `Uploding ${uploadProgress}` : "Upload"}
            type="button"
            variant='primary'
            className="rounded-xl text-center py-1 px-10 shadow-[0px_3px_6px_#031F3A59] "
            onClick={handleSaved}
          />
        </div>
      </div>
    </div>
  );
};

export default SaveWhiteBoardImageModel;