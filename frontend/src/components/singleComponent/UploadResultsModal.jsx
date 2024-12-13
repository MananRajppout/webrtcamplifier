import React from 'react';
import Button from '../shared/button';

const UploadResultsModal = ({ onClose, successResults, rejectedData }) => {
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-5 w-1/2">
        <h2 className="text-lg font-bold mb-4">Upload Results</h2>
        
        {/* Success Results Table */}
        <h3 className="font-semibold mb-2">Success Results</h3>
        <table className="min-w-full border-collapse border border-gray-200 mb-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Row</th>
              <th className="border border-gray-300 p-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {successResults.map((result, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{result.row}</td>
                <td className="border border-gray-300 p-2">{result.message}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Rejected Data Table */}
        <h3 className="font-semibold mb-2">Rejected Data</h3>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Row</th>
              <th className="border border-gray-300 p-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {rejectedData.map((data, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{data.row}</td>
                <td className="border border-gray-300 p-2">{data.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
          <Button
            children='Close'
            variant='secondary'
            type='button'
            className='px-4 mt-4 py-2 rounded-lg'
            onClick={onClose}
          />
       
      </div>
    </div>
  );
};

export default UploadResultsModal;