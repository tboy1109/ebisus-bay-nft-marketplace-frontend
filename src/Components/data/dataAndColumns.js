// import { CellDef, ColumnDef, DataRow } from '../../../src/types';

export function createFakeDataAndColumns(
    numRows,
    numCols,
    dataGen,
    options,
) {
    return {
        columns: createFakeColumns(numCols),
        rows: createFakeData(numRows, numCols, dataGen, options),
    };
}

export function createFakeColumns(numCols) {
    const cols = [];
    for (let i = 0; i < numCols; i++) {
        cols.push({
            fieldName: `col-${i}`,
            width: 50,
        });
    }
    return cols;
}

export function createFakeData(
    numRows,
    numCols,
    dataGen,
    options,
) {
    const rows= [];
    for (let i = 0; i < numRows; i++) {
        const row= {};
        for (let j = 0; j < numCols; j++) {
            row[`col-${j}`] = {
                getText: () => `${i + 1}x${j + 1}`,
                data: dataGen(j, i),
                ...options,
            };
        }
        rows.push(row);
    }
    return rows;
}
