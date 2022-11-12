import { Typography } from '@mui/material';
import { Box, Container } from '@mui/system';
import Copyright from './Copyright';

const About = () => {
    return (
        <>
            <Container
                maxWidth="md"
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: 2,
                    my: 10,
                    py: 10,
                }}
            ></Container>
        </>
    );
};

export default About;
