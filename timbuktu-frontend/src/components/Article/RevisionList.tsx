// components/Article/RevisionList.tsx
import React, { SetStateAction, useEffect } from 'react';
import { Box, List, ListItem, Text, Badge, Link as ChakraLink, Divider, Input, Button, Toast } from '@chakra-ui/react';
import { Revision } from '@/types'; // Adjust path
import axios, { AxiosRequestConfig } from 'axios';
import { body, header } from 'framer-motion/client';

interface RevisionListProps {
  revisions: Revision[];
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>;
  articleTitle: string; // Normalized title for potential future diff links
}

const RevisionList: React.FC<RevisionListProps> = ({ revisions, articleTitle, setRevisions }) => {
  const [newComment, setNewComment] = React.useState<string>('');
  
  const [iscommenting, SetisCommenting] = React.useState<boolean>(false);
  const [indexCom, setIndex] = React.useState<number>(0);

  

  if (!revisions || revisions.length === 0) {
    return <Text>No revision history found for this article.</Text>;
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  };

  const handleSubmit = async (revision : Revision) => { 
    try {

      const config: AxiosRequestConfig = {
              headers: { 
                  'Content-Type': 'multipart/form-data',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`}
      }
      const response = await axios.patch(`http://localhost:3001/articles/${articleTitle}/revisions/${revision.id}`,
        {
          body: {
            comment : newComment
          }
      },  
      config) // Adjust token retrieval as needed;
      console.log('Comment submitted:', response.data);
      setRevisions((prevRevisions: any) => {
        return prevRevisions.map((rev: any) => {
          if (rev.id === revision.id) {
            return {
              ...rev,
              comments: rev.comments ? [...rev.comments, { content: newComment, user_id: null, created_at: new Date().toISOString() }] : [{ content: newComment, user_id: null, created_at: new Date().toISOString() }]
            };
          }
          return rev;
        });
      });
      setNewComment('');
    } catch (error) {
      Toast({
        title: "Error",
        description: "Failed to submit comment.",
        status: "error",
      })
      console.error('Error submitting comment:', error);
    }
  }

  useEffect(() => {
    console.log('revisions:', revisions);
  }, [revisions]);

  return (
    <List spacing={5} mt={4}>
      {revisions.map((revision, index) => (
        <ListItem key={revision.id} pb={5} borderBottomWidth={index < revisions.length - 1 ? '1px' : '0px'} borderColor="gray.200">
          <Box>
            <Text fontSize="lg" fontWeight="medium">
              {new Date(revision.timestamp).toLocaleString()} {/* Format timestamp */}
            </Text>
            <Text fontSize="sm" color="gray.600" mt={1}>
              Edited by: {' '}
              <Badge colorScheme={revision.user ? 'blue' : 'gray'}>
                {revision.user ? revision.user.username : 'Anonymous'}
              </Badge>
              {}
            </Text>
            {revision &&
            revision?.comments !== null &&
             revision.comments!.length > 0 && 
              <>
               <Text fontSize="sm" mt={1} fontStyle="italic" color="gray.700">
              Comments:
               </Text>
               <Box mt={2}>
              {revision.comments?.map((com, index) => (
                <>
                {console.log('Comment:', com.content.split('\n').at(3))}
                <Text key={index} fontSize="sm" color="gray.800" mt={1}>
                  {com.user_id !== null &&
                  <Badge colorScheme="blue" mr={1}>
                    {com.user_id}
                  </Badge>
                  }
                  {com.content.split('\n').length > 1 ?
                    com.content.split('\n').at(3)
                  :
                    com.content
                  }
                
                  {com.content.split('\n').length > 1 && 
                  <Text key={index} fontSize="10px" color="gray.800" mt={1}>
                      {new Date(com.created_at).toLocaleString()}
                  </Text>
                }
                </Text>
                </>
              ))}
               </Box>
              </>
            }
            <Box onClick={() => {SetisCommenting(!iscommenting), setIndex(index)}} mt={2} cursor="pointer" color="blue.500">
              Comment
            </Box>
            {iscommenting &&
              indexCom === index && 
              <>
                <Input
                placeholder="Add a comment"
                value={newComment}
                onChange={(e) => handleCommentChange(e)}
                mt={2}/>
                <Button onClick={() => {handleSubmit(revision);}} colorScheme="blue" mt={2}>
                  Submit
                </Button>
              </>
            }

          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default RevisionList;