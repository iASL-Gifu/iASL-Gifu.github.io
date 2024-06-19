import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function createData(
  date: string,
  item: string,
  detail: string,
) {
  return { date, item, detail};
}

const rows = [
  createData('December 1, 2022', 'Lab started', 'We started our lab!'),
  createData('August, 2023', 'Autoware AI challenge Preliminary tournament', 'First place in the student category'),
  createData('November, 2023', 'Autoware AI challenge Final tournament', 'Gained good experience.'),
  createData('February, 2024', 'Autoware AI challenge Simulation tournament', 'Two people gain community contribution'),
  createData('May, 2024', 'F1tenth tournament in ICRA', 'World-class level is very challenging'),
];

export const CustomizedTables = () => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700,}} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell align="left">Main items</StyledTableCell>
            <StyledTableCell align="left">Detail</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <StyledTableRow key={row.item}>
              <StyledTableCell component="th" scope="row">
                {row.date}
              </StyledTableCell>
              <StyledTableCell align="left">{row.item}</StyledTableCell>
              <StyledTableCell align="left">{row.detail}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}