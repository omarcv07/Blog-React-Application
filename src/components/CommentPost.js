import React from 'react';

const CommentPost = (props) => {
    const { content, commentOwnerUsername, createdAt } = props.comment

    return (
        <div className='comment'>
            <span style={{ fontStyle: 'italic', color: '#0ca5e297' }}>
                Comment By {commentOwnerUsername}
                {' on '}
                <time style={{ fontStyle: 'italic'}}>
                    {' '}
                    {new Date(createdAt).toDateString()}
                </time>
            </span>

            <p>{content}</p>
        </div>
    );
}

export default CommentPost;