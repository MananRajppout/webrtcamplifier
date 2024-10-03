import React, { FC, ReactNode } from 'react'

const PermissionButton = ({ permission,children,onClick,className,...props }) => {
    return (
        <button className={`p-2 text-2xl rounded-full bg-gray-200 text-black relative ${className}`} onClick={onClick} {...props}>
            {children}
            {
                !permission &&
                <span className='w-5 h-5 bg-red-600 text-white absolute -top-1 -right-1 rounded-full text-sm'>!</span>
            }
        </button>
    )
}

export default PermissionButton