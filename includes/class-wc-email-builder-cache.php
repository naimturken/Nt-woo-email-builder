<?php
class WC_Email_Builder_Cache {
    public static function get($key) {
        $cached = get_transient('wc_email_builder_' . $key);
        return $cached ? json_decode($cached, true) : false;
    }

    public static function set($key, $data, $expiration = 3600) {
        set_transient('wc_email_builder_' . $key, json_encode($data), $expiration);
    }

    public static function delete($key) {
        delete_transient('wc_email_builder_' . $key);
    }
}

