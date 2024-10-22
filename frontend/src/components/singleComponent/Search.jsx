'use client';
import React, { useEffect, useState } from 'react';
import { CiSearch } from "react-icons/ci";

const Search = ({ placeholder, onSearch, inputClassName, iconClassName }) => {
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchInput);
    }, 300); 

    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

 

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className={`w-full px-4 py-2 border rounded-lg pl-14 bg-[#eaeaea] ${inputClassName}`}
      />
      <div className={`absolute top-1/2 left-1 -translate-y-1/2 bg-[#f3f4f5] rounded-lg p-2 ${iconClassName}`}>
      <CiSearch />
      </div>
    </div>
  );
};

export default Search;
