import Button from "../shared/button";
import Heading20pxBlueUC from "../shared/Heading20pxBlueUC";

const ViewCompanyModal = ({ onClose, currentCompany }) => {
  console.log('current admin', currentCompany)
 


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white py-8  rounded-lg w-[420px] h-[90vh] overflow-x-auto">
       <div className="meeting_bg pl-8 py-2 flex justify-center items-start flex-col pt-3">
          <Heading20pxBlueUC
          children={`${currentCompany.name}`}
          />
         
       </div>
       <div className="pt-5 px-8">
        <p className="text-lg font-semibold text-custom-dark-blue-2 pb-4">Company Details</p>
        <div className="flex flex-col gap-5">
            <div className="flex justify-start items-center gap-2">
              <p className="font-semibold text-custom-dark-blue-1">Name: </p>
              <p className="text-sm">{currentCompany.name}</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <p className="font-semibold text-custom-dark-blue-1">Industry: </p>
              <p className="text-sm">{currentCompany.industry}</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <p className="font-semibold text-custom-dark-blue-1">Official Address: </p>
              <p className="text-sm">{currentCompany.officialAddress}</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <p className="font-semibold text-custom-dark-blue-1">Billing Address: </p>
              <p className="text-sm">{currentCompany.billingAddress}</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <p className="font-semibold text-custom-dark-blue-1">Company Email: </p>
              <p className="text-sm">{currentCompany.companyEmail}</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <p className="font-semibold text-custom-dark-blue-1">Website: </p>
              <p className="text-sm">{currentCompany.website}</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <p className="font-semibold text-custom-dark-blue-1">Mobile: </p>
              <p className="text-sm">{currentCompany.mobile}</p>
            </div>
            <div className="flex justify-start items-center gap-2">
              <p className="font-semibold text-custom-dark-blue-1">Country: </p>
              <p className="text-sm">{currentCompany.country}</p>
            </div>
            
        </div>
        {/* <div className="flex flex-col justify-center items-start pt-3">
              <p className="font-semibold text-custom-dark-blue-1">Email</p>
              <p className="text-sm">{currentCompany.email}</p>
            </div> */}
       </div>
       <div className="flex justify-center items-center pt-5">
            <Button
            children='Close'
            type="button"
            variant="default"
            className="text-white px-5 py-2 rounded-lg"
            onClick={onClose}
            />
       </div>
      </div>
    </div>
  );
};

export default ViewCompanyModal;
