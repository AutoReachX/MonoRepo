def test_basic_math():
    """Basic test to ensure pytest is working"""
    assert 1 + 1 == 2


def test_string_operations():
    """Test string operations"""
    test_string = "AutoReach"
    assert len(test_string) == 9
    assert test_string.lower() == "autoreach"


def test_list_operations():
    """Test list operations"""
    test_list = [1, 2, 3, 4, 5]
    assert len(test_list) == 5
    assert sum(test_list) == 15
