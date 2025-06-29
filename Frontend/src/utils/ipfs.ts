import axios from 'axios';

const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
const PINATA_API_KEY = "9d596c5fe6cba22a5f7c";
const PINATA_API_SECRET = "2f2f8499c1567429943b0b54af3cc85ae2bf8cd73ac78aab4867e7ae552a0310";

export const fetchIPFSContent = async (uri: string) => {
  try {
    if (!uri.startsWith('ipfs://')) {
      throw new Error('Not an IPFS URI');
    }
    const hash = uri.replace('ipfs://', '');
    const response = await fetch(`${IPFS_GATEWAY}${hash}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching IPFS content:', error);
    return null;
  }
};

export const uploadFileToIPFS = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      data: formData,
      maxBodyLength: Infinity,
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

export const uploadJSONToIPFS = async (jsonObject: any): Promise<string> => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data: jsonObject,
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
    });

    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw new Error('Failed to upload JSON to IPFS');
  }
};