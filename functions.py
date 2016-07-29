import itertools
MYSQL_FORMAT = '%Y-%m-%d %H:%M:%S'

def row_to_dict(row, names):
    _dict = dict(zip(names, row))
    if _dict['start_time']:
        _dict['start_time'] = _dict['start_time'].strftime(MYSQL_FORMAT)
    if _dict['end_time']:
        _dict['end_time'] = _dict['end_time'].strftime(MYSQL_FORMAT)
    return _dict

def dictfetchall(cursor):
    """Returns all rows from a cursor as a list of dicts"""
    desc = cursor.description
    return [dict(itertools.izip([col[0] for col in desc], row)) for row in cursor.fetchall()]
