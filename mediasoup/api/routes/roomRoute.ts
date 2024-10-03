import express,{Request,Response} from 'express'


function generateRandomString() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  
    // Function to generate a random part with specified length
    function getRandomPart(length: number) {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }
 
    const part2 = getRandomPart(3).toUpperCase();        
    const part3 = getRandomPart(3).toUpperCase(); 
  
    return `${part2}${part3}`;
}

export const createRoom = (req:Request,res:Response) => {
    try {
        const id = generateRandomString();
        res.status(200).json({
            success: false,
            id
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: (error as Error).message
        })
    }
}

const router = express.Router();

router.route('/api/v1/create-room-id').get(createRoom);

export default router;