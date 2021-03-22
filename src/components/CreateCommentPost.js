import React, { useEffect, useState } from 'react';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import { createComment } from '../graphql/mutations';

const CreateCommentPost = (props) => {
    const { postId } = props;

    const [state, setState] = useState({
        commentPostId: postId,
        commentOwnerId: '',
        commentOwnerUsername: '',
        content: '',
        createdAt: new Date().toISOString(),
    });

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        try {
            const user = await Auth.currentUserInfo();
            if (user) {
                setState({ 
                    ...state, 
                    commentOwnerId: user.attributes.sub, 
                    commentOwnerUsername: user.username 
                });
            }
        } catch(error) {
            console.error(error);
        }
    }
    
    const handleChange = (event) => setState({ ...state, [event.target.name]: event.target.value });

    const handleAddComment = async (event) => {
        event.preventDefault();
        try {
            await API.graphql(graphqlOperation(createComment, { input: { ...state } }));

            setState({ ...state, content: '' })
        } catch(error) {
            console.error(error);
        }
    }

    return (
        <div>

            <form className='add-comment' onSubmit={handleAddComment}> 

                <textarea 
                    type='text'
                    name='content'
                    rows='3'
                    cols='40'
                    required
                    placeholder='Add Your Comment...'
                    value={state.content}
                    onChange={handleChange}
                    />

                <input 
                    className='btn'
                    type='submit'
                    style={{ fontSize: '19px' }}
                    value='Add Comment'
                    />

            </form>

        </div>
    );
}

export default CreateCommentPost;