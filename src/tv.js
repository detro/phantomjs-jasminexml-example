function Tv() {
    var _currentChannel = "BBC 1",
        _on = false,
        _currentVolume = 50;
    
    var _setChannel = function(newChannel) {
        if ( !_on ) {
            return false; // tv is off!!!
        }
        _currentChannel = newChannel;
        return true;
    };
    
    var _channel = function() {
        if ( !_on ) {
            return false; // tv is off!!!
        }
        return _currentChannel;
    };
    
    var _turnOn = function() {
        if ( !_on ) {
            _on = true;
            return true;
        }
        return false;
    };
    
    var _turnOff = function() {
        if ( _on ) {
            _on = false;
            return true;
        }
        return false;
    };
    
    var _volume = function() {
        if ( !_on ) {
            return false;
        }
        return _currentVolume;
    };
    
    var _setVolume = function(newVolume) {
        if ( _on ) {
            _currentVolume = newVolume;
            return true;
        }
        return false;
    };
    
    return {
        setChannel : _setChannel,
        channel : _channel,
        turnOn : _turnOn,
        turnOff : _turnOff,
        setVolume : _setVolume,
        volume : _volume,
        isOn : function(){ return _on; }
    };
};