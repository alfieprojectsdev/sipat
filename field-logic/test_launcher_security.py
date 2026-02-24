import unittest
from unittest.mock import patch, MagicMock
import os
import sys
import io

# Add current directory to path so we can import launcher
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import launcher

class TestLauncherSecurity(unittest.TestCase):
    @patch('subprocess.Popen')
    def test_path_traversal_prevention(self, mock_popen):
        # Mock configuration
        launcher.MEDIA_DIR = '/tmp/media'
        launcher.VLC_PATH = '/usr/bin/vlc'

        filename = '../secret.txt'
        uri = f'fieldlogic://open?file={filename}&t=0'

        with patch.object(sys, 'argv', ['launcher.py', uri]):
            with patch('sys.stdout', new=io.StringIO()) as fake_stdout:
                launcher.main()
                output = fake_stdout.getvalue()

        self.assertFalse(mock_popen.called, "subprocess.Popen should not be called for path traversal attempt")
        self.assertIn("Error: Invalid filename (path traversal detected)", output)

    @patch('subprocess.Popen')
    def test_absolute_path_prevention(self, mock_popen):
        # Mock configuration
        launcher.MEDIA_DIR = '/tmp/media'
        launcher.VLC_PATH = '/usr/bin/vlc'

        filename = '/etc/passwd'
        uri = f'fieldlogic://open?file={filename}&t=0'

        with patch.object(sys, 'argv', ['launcher.py', uri]):
            with patch('sys.stdout', new=io.StringIO()) as fake_stdout:
                launcher.main()
                output = fake_stdout.getvalue()

        self.assertFalse(mock_popen.called, "subprocess.Popen should not be called for absolute path attempt")
        self.assertIn("Error: Invalid filename (path traversal detected)", output)

    @patch('subprocess.Popen')
    def test_invalid_timestamp(self, mock_popen):
        # Mock configuration
        launcher.MEDIA_DIR = '/tmp/media'
        launcher.VLC_PATH = '/usr/bin/vlc'

        filename = 'interview.webm'
        uri = f'fieldlogic://open?file={filename}&t=not-a-number'

        with patch.object(sys, 'argv', ['launcher.py', uri]):
            with patch('sys.stdout', new=io.StringIO()) as fake_stdout:
                launcher.main()
                output = fake_stdout.getvalue()

        self.assertFalse(mock_popen.called, "subprocess.Popen should not be called for invalid timestamp")
        self.assertIn("Error: Invalid timestamp", output)

    @patch('subprocess.Popen')
    def test_valid_path(self, mock_popen):
        # Mock configuration
        launcher.MEDIA_DIR = '/tmp/media'
        launcher.VLC_PATH = '/usr/bin/vlc'

        filename = 'interview_01.webm'
        uri = f'fieldlogic://open?file={filename}&t=123.45'

        with patch.object(sys, 'argv', ['launcher.py', uri]):
             with patch('sys.stdout', new=io.StringIO()) as fake_stdout:
                launcher.main()
                output = fake_stdout.getvalue()

        self.assertTrue(mock_popen.called, "subprocess.Popen should be called for valid path")
        args, _ = mock_popen.call_args
        cmd = args[0]
        file_path = cmd[1]
        timestamp_arg = cmd[2]

        expected_path = os.path.abspath(os.path.join('/tmp/media', filename))
        self.assertEqual(file_path, expected_path)
        self.assertEqual(timestamp_arg, "--start-time=123.45")

if __name__ == '__main__':
    unittest.main()
