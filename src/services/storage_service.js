import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import fs from "fs"

class StorageService {
    static #storageInstance;

    static init(storageInstance) {
        this.#storageInstance = storageInstance
    }
    
    constructor() {
        if(StorageService.#storageInstance == undefined) {
            throw new ReferenceError('Storage service must be initialized before accessing')
        }
    }

    async upload({file, username, postId}) {
        const childPath = `${username}/${postId}/${file.filename}`
        const fileRef = ref(StorageService.#storageInstance, childPath)
        const fileBuffer = fs.readFileSync(file.path)
        const metadata = {     
            contentType: file.mimetype,
        }
        const uploadTask = uploadBytesResumable(fileRef, fileBuffer, metadata);
        
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100
                    console.log(`Upload is ${progress} % done`)
                    switch (snapshot.state) {
                        case 'running':
                            console.log('Upload is running')
                            break
                        case 'paused':
                            console.log('Upload is paused')
                            break
                    }
                },
                (error) => {
                    switch (error.code) {
                        case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                            break
                        case 'storage/canceled':
                        // User canceled the upload
                            break
                        case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                            break
                    }
                    reject(error)
                },
                async () => {
                    const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
                    resolve(downloadUrl)
                }
            )
        })
        
    }

}

export default StorageService