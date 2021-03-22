import React, { Fragment, useEffect, useState } from 'react';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import { updatePost } from '../graphql/mutations';

const EditPost = (props) => {
    const { post } = props;

    const [state, setState] = useState({
        id: post.id ? post.id : '',
        postOwnerId: '',
        postOwnerUsername: '',
        postTitle: post.postTitle ? post.postTitle : '',
        postBody: post.postBody ? post.postBody : '',
    });

    const [show, setShow] = useState(false);

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

    useEffect(() => {
        getUser();
    }, [])

    const handleUpdatePost = async (event) => {
        event.preventDefault(); 
        try {
            await API.graphql(graphqlOperation(updatePost, { input: {...state} }));
            setShow(!show);
        } catch(error) {
            console.error(error);
        }
    }

    const handleChange = event => {
        setState({ ...state, [event.target.name]: event.target.value });
    }

    const handleModal = () => { 
        setShow(!show);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;

    }

    return (
        <Fragment>
            {
                show && (
                    <div className='modal'>
                        <button className='close' onClick={handleModal}>
                            X
                        </button>

                        <form className='add-post' onSubmit={(event) => handleUpdatePost(event)}>

                            <input 
                                style={{ fontSize: '19px' }}
                                type='text' placeholder='Title'
                                name='postTitle' value={state.postTitle}
                                onChange={handleChange}
                                />

                            <input
                                style={{ height: '150px', fontSize: '19px' }}
                                type='text'
                                name='postBody'
                                value={state.postBody}
                                onChange={handleChange}
                                />

                            <button>Update Post</button>
                        </form>
                    </div>
                )
            }

            <button onClick={handleModal}>Edit</button>

        </Fragment>
    );
}

export default EditPost;