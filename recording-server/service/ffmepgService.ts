import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath('C:/ffmpeg/bin/ffmpeg.exe');


/** 
  Merges and converts .webm files in a directory to a single .mp4 file.
  @param dirPath: The path to the directory containing the .webm files to merge and convert.
  @returns The path to the merged and converted MP4 file, or undefined if an error occurs.
*/

export async function mergeAndConvertVideos(dirPath: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dirPath)) {
      console.error('Directory not found!');
      reject('Directory not found');
      return;
    }

    const files = fs.readdirSync(dirPath);

  
    const webmFiles = files.filter(file => file.endsWith('.webm'));

    if (webmFiles.length === 0) {
      console.log('No .webm files found in the directory.');
      reject('No .webm files found');
      return;
    }

    
    const fileListPath = path.join(dirPath, 'filelist.txt');
    const fileListContent = webmFiles.map(file => `file '${path.join(dirPath, file)}'`).join('\n');

    
    fs.writeFileSync(fileListPath, fileListContent);

   
    const outputFilePath = path.join(process.cwd(),'./public/recordings/',`${path.basename(dirPath)}.mp4`);

    // Use FFmpeg to concatenate and convert to MP4
    ffmpeg()
      .input(fileListPath)
      .inputOptions(['-f', 'concat', '-safe', '0']) 
      .output(outputFilePath)
      .on('start', () => {
        console.log('FFmpeg process started');
      })
      .on('end', () => {
        console.log('FFmpeg process finished');
        
       
        fs.unlinkSync(fileListPath);

       
        webmFiles.forEach(file => {
          const filePath = path.join(dirPath, file);
          fs.unlinkSync(filePath); 
        });

      
        try {
          fs.rmdirSync(dirPath); 
          console.log(`Directory ${dirPath} has been deleted.`);
        } catch (err) {
          console.error(`Failed to delete directory ${dirPath}:`, err);
        }

        resolve(outputFilePath); 
      })
      .on('error', (err: any) => {
        console.error('FFmpeg error:', err);
        reject(err); 
      })
      .run();
  });
}


