import React, { useState, useEffect } from 'react';
import { API , Auth, graphqlOperation } from 'aws-amplify';
import { createPost } from '../graphql/mutations';

const CreatePost = () => {
    const [state, setState] = useState({
        postOwnerId: '',
        postOwnerUsername: '',
        postTitle: '',
        postBody: '',
        createdAt: new Date().toISOString(),
    });

    useEffect(() => {
        getUser();
    },[])

    const getUser = async () => {
        try {
            const user = await Auth.currentUserInfo();

            if (user) {
                setState({ 
                    ...state, 
                    postOwnerId: user.attributes.sub, 
                    postOwnerUsername: user.username 
                });
            }
        } catch(error) {
            console.error(error);
        }
    }

    const handleAddPost = async (event) => {
        event.preventDefault();
        try {
            await API.graphql(graphqlOperation(createPost, { input: state }));

            setState({ ...state, postTitle: '', postBody: '' })
        } catch(error) {
            console.error(error);
        }
    }

    const handleChangePost = event => setState({ ...state, [event.target.name]: event.target.value });

    return (
        <form className='add-post' onSubmit={handleAddPost}>
            <input 
                style={{ font: '19px' }}
                name='postTitle'
                placeholder='Title'
                type='text'
                required
                value={state.postTitle}
                onChange={handleChangePost}
                />

            <input 
                style={{ font: '19px' }}
                name='postBody'
                placeholder='New Blog Post'
                type='text'
                rows='3'
                cols='40'
                value={state.postBody}
                onChange={handleChangePost}
                required
                />

            <input 
                type='submit'
                className='btn'
                style={{ fontSize: '19px' }}
                />

        </form>
    );
}

export default CreatePost;