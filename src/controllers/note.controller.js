import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { Note } from '../models/notes.model.js'


const createNote = asyncHandler(async(req, res) =>  {


    try {
        if(!req.user?._id)
        {
            throw new ApiError(400,"unauthorized user")
        }
    
        const note = req.body.note
    
        if(!note)
        {
            throw new ApiError(400, "note required")
        }
    
        let audioFileLocalpath
    
        if(req.file)
        {
            audioFileLocalpath  = req.file.path
        }

       // console.log("note :" , note, "audio : ", audioFileLocalpath);
        
    
        let audioFileCloud
        if(audioFileLocalpath)
        {
            audioFileCloud = await uploadOnCloudinary(audioFileLocalpath)
            if(!audioFileCloud)
                {
                    throw new ApiError(400, "audio file not uploaded")
                }
        }
    
        
        const createnote  = await Note.create({
            note: note,
            audio: audioFileCloud ? audioFileCloud.url : audioFileCloud,
            owner: req.user?._id
        }) 
    
        if(!createnote)
        {
            throw new ApiError(500, "Internal server error failed to create note")
        }
    
        return res
        .status(200)
        .json( new ApiResponse(200, createnote, "Note created successfully"))
    } catch (error) {
            throw new ApiError(400, error.message || "something went wrong failed to create note")
    }


})

const updateNote = asyncHandler(async(req, res) =>{

try {
    
        if(!req.user?._id)
        {
             throw new ApiError(400, "unauthorized user")
        }
    
        const {noteId} = req.params
    
        if(!noteId)
        {
            throw new ApiError(400, "Note not found")
        }
    
        const newnote  = req.body.note
    
    
        if(!newnote && ! req.file)
        { 
            throw new ApiError(400, "some updation required")
        }
    
        let audioFileLocalpath = req.file?.path

        //console.log("noteId: ", noteId, "newnote :", newnote, "audio :", audioFileLocalpath);
        

        let audioFileCloud
        if(audioFileLocalpath)
        {
            audioFileCloud = await uploadOnCloudinary(audioFileLocalpath)
            if(!audioFileCloud)
            {
                throw new ApiError(400, "audio file not uploaded")
            }
        }
    
    
        const checkUserandNote = await Note.findOne({ _id: noteId, owner: req.user?._id })
    
        if(!checkUserandNote)
        {
            throw new ApiError(404, "unauthorized access user with this note not found")
        }
    
        let oldNote
        if(!newnote)
        {
            oldNote  = checkUserandNote.note
        }
        let oldAudioFile
        if(!req.file)
        {
            oldAudioFile  = checkUserandNote.audio
        }
    
    
        const updatenote = await Note.findByIdAndUpdate(
            {
                _id: noteId
            },
            {
                $set: {
                    note: newnote ? newnote : oldNote,
                    audio : audioFileCloud ? audioFileCloud.url : oldAudioFile
                }
            },
            {
                new: true
            }
            )
    
        if(!updatenote)
        {
            throw new ApiError(500, "Internal server error failed to update note")
        }
    
    
        return res
        .status(200)
        .json(new ApiResponse(200, updatenote, "Note updated successfully"))
} catch (error) {
      throw new ApiError(400, error.message || "something went wrong failed to update note")
}



})

const getNotebyId  = asyncHandler(async(req, res)   =>{


   try {
     if(!req.user?._id)
     {
         throw new ApiError(400, "unauthorized user")
     }
 
     const{noteId} = req.params
     if(!noteId)
         {
             throw new ApiError(404, "Note not found")
         }
     
 
     const note = await Note.findById(noteId)
 
     if(!note)
     {
         throw new ApiError(404, "Note not found")
     }
     
 
     return res
     .status(200)
     .json( new ApiResponse(200, note, "Note fetched successfully"))
   } catch (error) {
        throw new ApiError(400, error.message || "something went wrong failed to get note")
   }


})

const deleteNote = asyncHandler(async(req, res) =>{


    if(!req.user?._id)
    {
        throw new ApiError(400, "unauthorized user")
    }

    const {noteId} = req.params

    if(!noteId)
    {
        throw new ApiError(404, "note not found")
    }

    const checkUserandNote = await Note.findOne({ _id: noteId, owner: req.user?._id })

    if(!checkUserandNote)
    {
        throw new ApiError(400, "unauthorized access user with note not found")
    }

    const deletenote = await Note.findByIdAndDelete(noteId)

    if(!deletenote)
    {
        throw new ApiError(500, "Internal server error failed to delete note")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, deletenote, "Note deleted successfully"))


})



export { createNote, updateNote, getNotebyId, deleteNote}
