import { Box, Button, Grid, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import configData from '../../config.json';

export const EndMessage = () => {
    return (
        <Box
            sx={{
                border: '1px solid grey',
                p: 2,
                borderRadius: 2,
            }}
        >
            <Grid
                container
                spacing={3}
                justifyContent={'center'}
                alignItems={'center'}
            >
                <Grid item xs={12}>
                    <img
                        src="/static/illustrations/dashboard-card.png"
                        alt="dashboard"
                    />
                </Grid>
                <Grid item xs={12} p={2}>
                    <Typography variant="body">
                        Keep track of shared expenses and settle your
                        corresponding balances in a convenient and personalized
                        way.
                    </Typography>
                </Grid>
                <Grid item>
                    <Button
                        variant="outlined"
                        component={RouterLink}
                        to={configData.USER_GROUPS_URL}
                    >
                        View Groups
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};
