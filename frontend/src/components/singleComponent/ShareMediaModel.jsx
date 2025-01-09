'use client'
import Button from "../shared/button";
import {
    EmailShareButton,
    EmailIcon,
    FacebookShareButton,
    WhatsappShareButton,
    WhatsappIcon,
    FacebookIcon,
    InstapaperShareButton,
    InstapaperIcon,
    TwitterShareButton,
    TwitterIcon,
    TelegramShareButton,
    TelegramIcon,
    LinkedinShareButton,
    LinkedinIcon
} from 'react-share';

const ShareMediaModel = ({ onClose,url,handleCopy }) => {

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-30">
            <div className="bg-white p-8 rounded-2xl w-[420px]">
                <h2 className="text-2xl font-semibold mb-1 text-custom-dark-blue-2">Share Media</h2>

                <div className="my-8">
                    <div className='flex items-center gap-4 justify-center'>
                        <EmailShareButton
                            url={url}

                        >
                            <EmailIcon size={40} round={true} />
                        </EmailShareButton>
                        <FacebookShareButton
                            url={url}

                        >
                            <FacebookIcon size={40} round={true} />
                        </FacebookShareButton>

                        <WhatsappShareButton
                            url={url}

                        >
                            <WhatsappIcon size={40} round={true} />
                        </WhatsappShareButton>
                        <InstapaperShareButton
                            url={url}

                        >
                            <InstapaperIcon size={40} round={true} />
                        </InstapaperShareButton>
                        <TwitterShareButton
                            url={url}

                        >
                            <TwitterIcon size={40} round={true} />
                        </TwitterShareButton>
                        <TelegramShareButton
                            url={url}

                        >
                            <TelegramIcon size={40} round={true} />
                        </TelegramShareButton>
                        <LinkedinShareButton
                            url={url}

                        >
                            <LinkedinIcon size={40} round={true} />
                        </LinkedinShareButton>
                    </div>
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
                        children="Copy URL"
                        type="button"
                        variant='primary'
                        onClick={handleCopy}
                        className="rounded-xl text-center py-1 px-7 shadow-[0px_3px_6px_#031F3A59] "
                    />
                </div>
            </div>
        </div>
    );
};

export default ShareMediaModel;
